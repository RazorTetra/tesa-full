// app/hooks/useData.js
import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export function useData(endpoint) {
  const { data, error, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 300000, // 5 menit
    dedupingInterval: 180000, // 3 menit
  });

  return {
    data: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}