export const dynamic = 'force-dynamic'

import Link from "next/link"
import { getProjects } from "@/lib/data-server"
import { PageHead, PageWrap } from "@/components/app/Page"
import { AttrTag, Empty } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"

export default async function WorkshopsPage() {
  const projects = await getProjects()
  const started = projects.filter((p) => p.workshop && (p.workshop.humanNotes || (p.workshop.insights && p.workshop.insights.length > 0)))
  return (
    <PageWrap>
      <PageHead eyebrow="Collaboration" title="Workshops" desc="Creative Intelligence Workshops where human thinking and AI insight build the strategic direction together." />
      {started.length === 0 ? (
        <RevealOnScroll>
          <Empty title="No workshops in progress" hint="Open a project workspace to start a workshop after AI understanding is approved." />
        </RevealOnScroll>
      ) : (
        <StaggerContainer>
          <div className="feat-list">
            {started.map((p: any) => (
              <RevealOnScroll key={p.id}>
                <Link href={`/dashboard/projects/${p.id}`} className="feat-row feat-row--4col">
                  <div className="stack gap-1">
                    <span className="tiny muted">{p.client}</span>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</span>
                  </div>
                  <div className="row gap-2 wrap">
                    <AttrTag attr="ai" /><AttrTag attr="human" />
                  </div>
                  <div className="tiny"><span className="eyebrow">Directions</span><p style={{ color: "var(--ink-2)", marginTop: 2 }}>{(p.workshop?.insights?.filter((i: any) => i.group === "directions").length || 0)} proposed</p></div>
                  <span className="btn btn-subtle btn-sm">Open</span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
