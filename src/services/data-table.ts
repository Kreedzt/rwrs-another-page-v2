import { request } from '@/lib/request';
import type { RequestOptions } from '@/lib/request';
import type { IDisplayServerItem } from '@/models/data-table.model';
import { parseServerListFromString } from '@/share/utils';

const SERVER_API_URL = '/api';

interface IDataTableListParams {
  start: number;
  size: number;
  names: 1 | 0;
  timeout?: number;
}

interface IDataTableService {
  list(params?: IDataTableListParams): Promise<IDisplayServerItem[]>;
  listAll(options?: { timeout?: number }): Promise<IDisplayServerItem[]>;
}

export const DataTableService: IDataTableService = {
  async list(params) {
    const queryParams = {
      start: params?.start ?? 0,
      size: params?.size ?? 20,
      names: params?.names ?? 1,
    };

    const url = `${SERVER_API_URL}/server_list?start=${queryParams.start}&size=${queryParams.size}&names=${queryParams.names}`;

    // Pass timeout if provided
    const requestOptions: RequestOptions = {};
    if (params?.timeout) {
      requestOptions.timeout = params.timeout;
    }

    try {
      // Add a timestamp to prevent caching
      const timestampedUrl = `${url}&_t=${Date.now()}`;
      const data = await request<string>(timestampedUrl, requestOptions, 'text');
      return parseServerListFromString(data);
    } catch (error: any) {
      console.error(`Error fetching server list: ${error.message}`);
      // Rethrow the error to allow proper handling in listAll
      throw error;
    }
  },

  async listAll(options = {}) {
    let start = 0;
    const size = 100;
    const totalServerList: IDisplayServerItem[] = [];
    let hasMoreData = true;
    const requestTimeout = options.timeout || 10000; // Default timeout for each request

    // Maximum number of batches to try (to prevent infinite loops)
    const MAX_BATCHES = 10;
    let batchCount = 0;
    let lastError: Error | null = null;

    // Reset any previous error state
    console.info(`Starting server list fetch with timeout: ${requestTimeout}ms`);

    try {
      while (hasMoreData && batchCount < MAX_BATCHES) {
        batchCount++;

        try {
          console.info(`Fetching batch ${batchCount}, starting at index ${start}`);
          // Use Promise.race to implement a timeout for each batch
          const newServerList = await DataTableService.list({
            start,
            size,
            names: 1,
            timeout: requestTimeout,
          });

          if (newServerList.length === 0) {
            // No more data to fetch
            console.info(`Batch ${batchCount} returned no servers, stopping`);
            hasMoreData = false;
          } else {
            console.info(`Batch ${batchCount} returned ${newServerList.length} servers`);
            totalServerList.push(...newServerList);
            start += size;

            // If we got fewer items than requested, we've reached the end
            if (newServerList.length < size) {
              console.info(`Batch ${batchCount} returned fewer than ${size} servers, stopping`);
              hasMoreData = false;
            }
          }
        } catch (error: any) {
          lastError = error;
          console.error(`Error in batch ${batchCount}: ${error.message}`);
          // Stop fetching more data on error
          hasMoreData = false;
        }
      }

      console.info(`Total servers fetched: ${totalServerList.length}`);

      // If we have data but also encountered an error, log a warning but return the data we have
      if (lastError && totalServerList.length > 0) {
        console.warn(`Returning ${totalServerList.length} servers despite error: ${lastError.message}`);
      }

      // If we have no data and encountered an error, throw the error
      if (lastError && totalServerList.length === 0) {
        throw lastError;
      }

      return totalServerList;
    } catch (error: any) {
      console.error(`Error in listAll: ${error.message}`);
      // Return whatever data we managed to collect before the error
      return totalServerList;
    }
  },
};
