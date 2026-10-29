import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : "Lỗi không xác định";
  const chunkError = /dynamically imported module|Failed to fetch|Loading chunk/i.test(message);
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <TriangleAlert className="size-8 text-warning" aria-hidden />
      <h1 className="text-xl font-bold">Đã xảy ra lỗi</h1>
      <p className="text-sm text-muted-foreground">
        {chunkError ? "Website vừa được cập nhật phiên bản mới. Hãy tải lại trang." : message}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
        <Button variant="outline" asChild>
          <Link to="/">Về Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
