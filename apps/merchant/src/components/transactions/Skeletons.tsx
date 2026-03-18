import { Card, CardContent } from "@orafi/ui";

interface SkeletonCardProps {
  count?: number;
}

export const KPICardSkeleton = () => {
  return (
    <Card className="w-full animate-pulse bg-white p-3">
      <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
      <CardContent className="mt-1.5 flex items-center justify-between !p-0">
        <div>
          <div className="mb-1.5 h-5 w-20 rounded bg-gray-200" />
          <div className="h-2 w-28 rounded bg-gray-200" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
      </CardContent>
    </Card>
  );
};

export const ChartSkeleton = ({ height = "h-64" }: { height?: string }) => {
  return (
    <div className={`flex animate-pulse items-center justify-center rounded-xl bg-gray-100 ${height}`}>
      <div className="text-sm text-gray-400">Loading chart...</div>
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 6 }: { columns?: number }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 w-full rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  );
};

export const CardSkeleton = ({ count = 1 }: SkeletonCardProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="animate-pulse bg-white p-4">
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
        </Card>
      ))}
    </>
  );
};

export const ListSkeleton = ({ count = 5 }: SkeletonCardProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
