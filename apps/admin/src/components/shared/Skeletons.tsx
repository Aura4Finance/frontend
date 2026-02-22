import { Card, CardContent } from "@orafi/ui";

interface SkeletonCardProps {
  count?: number;
}

export const KPICardSkeleton = () => {
  return (
    <Card className="bg-white w-full p-3 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
      <CardContent className="flex justify-between items-center mt-1.5 !p-0">
        <div>
          <div className="h-5 bg-gray-200 rounded w-20 mb-1.5"></div>
          <div className="h-2 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
      </CardContent>
    </Card>
  );
};

export const TableRowSkeleton = ({ columns = 6 }: { columns?: number }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

export const ChartSkeleton = ({ height = "h-64" }: { height?: string }) => {
  return (
    <div className={`bg-gray-100 rounded-xl ${height} animate-pulse flex items-center justify-center`}>
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  );
};

export const CardSkeleton = ({ count = 1 }: SkeletonCardProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="bg-white p-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <div key={idx} className="bg-gray-50 p-4 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
