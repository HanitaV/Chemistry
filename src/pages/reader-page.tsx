import { lazy, Suspense } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/page-header";
import { PageLoader } from "@/components/common/page-loader";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { content, getDocument, lessonPath } from "@/lib/content";
import { publicUrl } from "@/lib/utils";
import NotFoundPage from "./not-found-page";

const PdfViewer = lazy(() => import("@/components/pdf-viewer/pdf-viewer"));

export default function ReaderPage() {
  const { documentId } = useParams();
  const [params, setParams] = useSearchParams();
  const doc = getDocument(documentId);
  useStudyTimer("reading", !!doc);
  if (!doc) return <NotFoundPage what="Tài liệu" />;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const url = publicUrl(doc.path);
  const related = content.lessons.filter((l) => l.sources.some((s) => s.documentId === doc.id && (s.pages ?? []).includes(page)));

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <Breadcrumbs items={[{ label: "Thư viện", to: "/library" }, { label: doc.title }]} />
        <h1 className="text-lg font-bold leading-tight sm:text-xl">{doc.title}</h1>
        {related.length > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <BookOpen className="size-3.5" aria-hidden /> Trang {page} được dùng trong:
            {related.map((l) => (
              <Link key={l.id} to={lessonPath(l)} className="font-medium text-primary hover:underline">
                {l.title}
              </Link>
            ))}
          </p>
        )}
      </div>
      <Suspense fallback={<PageLoader label="Đang tải trình đọc PDF…" />}>
        <PdfViewer
          source={{ url }}
          openUrl={url}
          fileName={doc.path.split("/").pop() ?? "tai-lieu.pdf"}
          page={page}
          onPageChange={(p) => setParams({ page: String(p) }, { replace: true })}
        />
      </Suspense>
    </div>
  );
}
