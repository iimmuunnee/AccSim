# HANDOFF — 스크롤 드리븐 UX 전환 + CSS 최적화 + i18n 개선

**날짜**: 2026-03-08
**브랜치**: `main` (origin/main 대비 1 commit ahead + unstaged 변경)
**이전 HANDOFF**: 스크롤 버그 수정 + README 재작성 (2026-03-06, 완료)

---

## 1. 이번 세션 목표

기존 timer/rAF 기반 애니메이션을 **스크롤 드리븐(scroll-driven)** 방식으로 전환. 사용자 스크롤 속도에 맞춰 콘텐츠가 자연스럽게 펼쳐지는 Apple Keynote 스타일 UX 구현. 동시에 CSS 애니메이션 기반 배경 패턴을 제거하여 CPU 부하 감소.

---

## 2. 완료한 작업

### Hall 컴포넌트 스크롤 드리븐 전환

| Hall | 파일 | 변경 내용 |
|------|------|-----------|
| **IntroHall** | `IntroHall.tsx` | ExplosionSection을 `useScroll` + sticky 뷰포트(250vh)로 전환. rAF 타이머 루프 전부 제거. 그래프/카운트업이 스크롤 진행률에 동기화. 가장 큰 변경 (760줄→~500줄). |
| **ChipHall** | `ChipHall.tsx` | `PEDiagram` → `PEAssembly` 리팩토링. 자체 scroll 추적 제거, 부모에서 progress 주입받는 구조로 단순화. |
| **SimulatorHall** | `SimulatorHall.tsx` | `DataPacket` rAF 애니메이션 컴포넌트 삭제. `useScroll` 기반 컨베이어 벨트 전환. Station 카드 텍스트 크기 확대. |
| **ExecutionHall** | `ExecutionHall.tsx` | Gate 소개 섹션에 별도 `useScroll` 추적 추가. `STEP_STAGES` 매핑으로 하이레벨 설명 ↔ 타임라인 연동. |

### CSS 최적화

- `globals.css`: HallBackground 관련 `@keyframes` (gridPulse, dotDrift, gradientShift) 및 `.hall-bg-*` 클래스 전부 제거 → 단순 radial glow로 교체.

### i18n 텍스트 개선

- `ko.json` / `en.json`:
  - `chip.sectionB.transition` 키 추가
  - `execution.sectionA.subtext` 확장 (4개 게이트 설명)
  - `execution.sectionA.transition` 키 추가
  - `execution.highLevel` step1~4 이모지 + 상세 설명으로 교체

### 기타

- `SystolicScene.tsx`, `layout.tsx` (2개), `AboutProject.tsx`, `LiveDemo.tsx`, `PerformanceLab.tsx`, `ArchitectureHall.tsx`, `AcceleratorHall.tsx`: 소규모 조정

---

## 3. 신규 파일 (untracked)

| 파일 | 용도 |
|------|------|
| `layout/ScrollContainer.tsx` | SnapContainer 대체, 자연 스크롤 기반 컨테이너 |
| `layout/ScrollProgressBar.tsx` | 상단 스크롤 진행률 바 |
| `layout/SectionProgress.tsx` | 우측 dot 인디케이터 |
| `ui/HallBackground.tsx` | Hall별 테마 radial glow (CSS 애니메이션 제거) |
| `ui/InfoPanel.tsx` | 정보 패널 UI |
| `stores/useSectionStore.ts` | Zustand 섹션 상태 관리 |
| `public/*` | favicon, apple-touch-icon 등 정적 에셋 |
| `scripts/generate-favicons.py` | 파비콘 생성 스크립트 |

---

## 4. 시도했으나 미완료 / 주의사항

- **PerformanceLab, ArchitectureHall, LiveDemo, AboutProject**는 소규모 수정만 진행. 본격적인 스크롤 드리븐 전환은 미적용.
- **IntroHall**이 가장 큰 변경. 기존 rAF 기반 구간이 모두 스크롤 기반으로 바뀌었으므로 동작 확인 필수.
- `.claude/` 디렉토리가 untracked에 있음 — **커밋에 포함하지 말 것**.
- **SnapContainer → ScrollContainer 교체**가 이전 커밋(ed02e0e)에서 이루어짐. 현재 unstaged 변경은 그 위에 추가된 스크롤 드리븐 전환.

---

## 5. 다음 단계

1. **동작 확인** — `npm run dev`로 전 Hall 스크롤 동작 테스트. 특히 IntroHall ExplosionSection의 sticky 뷰포트 동작.
2. **나머지 Hall 스크롤 드리븐 전환** — PerformanceLab, ArchitectureHall, LiveDemo, AboutProject에 동일 패턴 적용 검토.
3. **모바일 테스트** — 스크롤 드리븐 방식이 모바일 터치 스크롤에서 잘 동작하는지 확인.
4. **빌드 테스트** — `npm run build`로 프로덕션 빌드 성공 여부 확인.
5. **README 스크린샷 추가** — 이전 세션에서 placeholder로 남긴 Demo/Screenshots 섹션에 실제 이미지 추가.

---

## 6. 참고사항

- **Author GitHub URL**: `github.com/iimmuunnee` — 변경하지 말 것.
- **Fallback 데이터**: 프론트엔드는 백엔드 없이도 `lib/api.ts`의 `getDemoData()` fallback으로 동작.
- **스크롤 드리븐 패턴**: `useScroll({ target, offset })` + `useMotionValueEvent` + 양자화(`Math.round(v * N) / N`)로 setState 횟수 최소화.
