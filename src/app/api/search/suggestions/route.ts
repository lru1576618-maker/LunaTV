/* eslint-disable @typescript-eslint/no-explicit-any,no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';
import { getAvailableApiSites, getCacheTime, getConfig } from '@/lib/config';
import { searchFromApi } from '@/lib/downstream';
import { yellowWords } from '@/lib/yellow';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // 获取认证信息
  const authInfo = getAuthInfoFromCookie(request);

  // 没有 auth Cookie，才判定为未登录
  if (!authInfo) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 获取存储类型
  const storageType =
    process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  // 非 localstorage 模式要求 username
  if (storageType !== 'localstorage' && !authInfo.username) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // 没有搜索关键词
  if (!query) {
    const cacheTime = await getCacheTime();

    return NextResponse.json(
      { results: [] },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Netlify-Vary': 'query',
        },
      }
    );
  }

  try {
    const config = await getConfig();

    // localstorage 模式没有 username 时，
    // 使用环境变量中的 USERNAME 作为站长身份
    const username =
      authInfo.username || process.env.USERNAME || '';

    const apiSites = await getAvailableApiSites(username);

    // 为每个源创建搜索请求
    const searchPromises = apiSites.map((site) =>
      Promise.race([
        searchFromApi(site, query),

        new Promise<any[]>((_, reject) =>
          setTimeout(
            () => reject(new Error(`${site.name} timeout`)),
            20000
          )
        ),
      ]).catch((err) => {
        console.warn(
          `搜索失败 ${site.name}:`,
          err instanceof Error ? err.message : err
        );

        // 单个源失败不影响其他源
        return [];
      })
    );

    // 等待所有源完成
    const results = await Promise.allSettled(searchPromises);

    // 只获取成功的结果
    const successResults = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<any[]> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);

    // 合并所有源的结果
    let flattenedResults = successResults.flat();

    // 黄色内容过滤
    if (!config.SiteConfig.DisableYellowFilter) {
      flattenedResults = flattenedResults.filter((result) => {
        const typeName = result.type_name || '';

        return !yellowWords.some((word: string) =>
          typeName.includes(word)
        );
      });
    }

    const cacheTime = await getCacheTime();

    // 没有搜索结果
    if (flattenedResults.length === 0) {
      return NextResponse.json(
        { results: [] },
        { status: 200 }
      );
    }

    // 返回搜索结果
    return NextResponse.json(
      { results: flattenedResults },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Netlify-Vary': 'query',
        },
      }
    );
  } catch (error) {
    console.error('搜索建议接口异常:', error);

    return NextResponse.json(
      {
        error: '搜索失败',
      },
      { status: 500 }
    );
  }
}
