import { Link } from "react-router";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/page-header";

export default function NotFoundPage({ what = "Trang" }: { what?: string }) {
  return (
    <PageContainer>
      <EmptyState
        icon={SearchX}
        title={`${what} không tồn tại`}
        description="Đường dẫn có thể đã thay đổi hoặc nội dung chưa được thêm vào website."
        action={
          <Button asChild>
            <Link to="/">Về Dashboard</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}
