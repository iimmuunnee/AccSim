# HANDOFF — 스크롤 버그 수정 + README 전면 재작성

## 작업 일시
2026-03-06

## 1. 목표

1. 홀 전환 시 스크롤 상태가 초기화되지 않아 첫 스크롤이 마지막 섹션으로 점프하는 버그 수정
2. README.md를 포트폴리오/캡스톤 프로젝트 문서 수준으로 처음부터 재작성
3. 재작성된 README를 포트폴리오용 GitHub README 구조로 섹션 재배치 및 중복 통합

---

## 2. 완료된 작업

### 작업 1: 홀 전환 스크롤 상태 미초기화 버그 수정 (✅ 완료)

- **파일**: `accsim/web/frontend/src/hooks/useSnapScroll.ts`
- **내용**: `reset()` 함수 추가 — `currentIndex.current = 0`, `scrollTop = 0`, `gestureLocked = false`, `accumulatedDelta = 0`, store `currentIndex`도 0으로 초기화. return 객체에 `reset` 포함.
- **근본 원인**: `SnapContainer`가 `layout.tsx`에 있어서 Hall 간 페이지 이동 시 재마운트되지 않음 → `useSnapScroll`의 `currentIndex` ref가 이전 Hall 값(예: 3) 유지 → 새 Hall에서 첫 스크롤이 `scrollToIndex(4)` 호출 → clamped되어 마지막 섹션으로 점프.

- **파일**: `accsim/web/frontend/src/components/layout/SnapContainer.tsx`
- **내용**: `next/navigation`의 `usePathname()` import 추가. `pathname` 변경 감지 `useEffect`에서 `reset()` 호출하여 Hall 전환 시 스크롤 상태 자동 초기화.

### 작업 2: README.md 전면 재작성 (✅ 완료)

- **파일**: `README.md`
- **내용**: 코드베이스 전체를 조사(9개 Hall 컴포넌트, UI/layout/three/d3 컴포넌트, hooks, stores, 백엔드 API, package.json 등)한 뒤 README를 처음부터 새로 작성. 12개 섹션: Project Overview, Exhibition Website Concept, Features(9개), Hall Structure(9개), Tech Stack, Key UX Systems(5개), Troubleshooting(7개 Problem/Cause/Solution), Future Improvements(6개), Quick Start, Project Structure, API Endpoints, Author.

### 작업 3: README 포트폴리오 구조 재정리 (✅ 완료)

- **파일**: `README.md`
- **내용**: 기존 내용 유지하면서 구조만 개선. 주요 변경:
  - 번호 접두사 제거 (`## 1. Project Overview` → `## Project Overview`)
  - Quick Start를 상단으로 이동 (개발자가 먼저 찾는 정보)
  - Demo / Screenshots 섹션 추가 (스크린샷은 placeholder)
  - `Project Structure` + `API Endpoints` → `System Architecture`로 통합 (아키텍처 다이어그램 + 데이터 흐름 + 디렉토리 구조 + API 테이블을 하나의 섹션에)
  - 버전 요구사항을 Quick Start에 통합
  - Author GitHub URL을 유저 수정값(`github.com/iimmuunnee`)으로 반영

---

## 3. 시도했으나 실패한 것

없음

---

## 4. 현재 상태

- **빌드**: 미확인 (이번 세션에서 `npm run build` 실행하지 않음)
- **테스트**: 미확인 (Python `pytest` 실행하지 않음)
- **커밋**: **uncommitted 변경사항 있음** — 이번 세션의 3개 작업 모두 uncommitted
- **원격**: `origin/main` 대비 로컬 2커밋 ahead (이전 세션 커밋), push 안 됨

---

## 5. 변경된 파일 목록

### 이번 세션에서 수정한 파일

| 파일 | 상태 |
|------|------|
| `README.md` | 수정 (전면 재작성 + 구조 재정리) |
| `accsim/web/frontend/src/hooks/useSnapScroll.ts` | 수정 (reset 함수 추가) |
| `accsim/web/frontend/src/components/layout/SnapContainer.tsx` | 수정 (pathname 감지 + reset 호출) |

### 이전 세션에서 수정되어 아직 uncommitted인 파일

| 파일 | 상태 |
|------|------|
| `accsim/web/frontend/messages/en.json` | 수정 |
| `accsim/web/frontend/messages/ko.json` | 수정 |
| `accsim/web/frontend/src/app/[locale]/layout.tsx` | 수정 |
| `accsim/web/frontend/src/app/globals.css` | 수정 |
| `accsim/web/frontend/src/components/halls/AboutProject.tsx` | 수정 |
| `accsim/web/frontend/src/components/halls/AcceleratorHall.tsx` | 수정 |
| `accsim/web/frontend/src/components/halls/ArchitectureHall.tsx` | 수정 |
| `accsim/web/frontend/src/components/halls/ChipHall.tsx` | 수정 |
| `accsim/web/frontend/src/components/halls/ExecutionHall.tsx` | 수정 |
| `accsim/web/frontend/src/components/halls/IntroHall.tsx` | 수정 |
| `accsim/web/frontend/src/components/halls/SimulatorHall.tsx` | 수정 |
| `accsim/web/frontend/src/components/ui/ScrollGuide.tsx` | 수정 |
| `accsim/web/frontend/src/components/layout/SectionProgress.tsx` | 신규 |
| `accsim/web/frontend/src/components/layout/SnapContainer.tsx` | 신규 |
| `accsim/web/frontend/src/components/ui/HallBackground.tsx` | 신규 |
| `accsim/web/frontend/src/components/ui/InfoPanel.tsx` | 신규 |
| `accsim/web/frontend/src/components/ui/TransitionFlash.tsx` | 신규 |
| `accsim/web/frontend/src/hooks/useSnapScroll.ts` | 신규 |
| `accsim/web/frontend/src/stores/useSectionStore.ts` | 신규 |

---

## 6. 다음 단계

1. **빌드 확인** — `cd accsim/web/frontend && npm run build`로 프론트엔드 빌드 성공 여부 확인
2. **스크롤 버그 수정 검증** — `npm run dev`로 개발 서버 실행 후:
   - `/ko/intro` 마지막 섹션까지 스크롤 → "다음 Hall" 클릭 → 다음 Hall에서 첫 스크롤이 섹션 0→1로 정상 이동하는지
   - 우측 dot이 첫 번째 위치에서 시작하는지
   - 여러 Hall 연속 이동 반복 확인
3. **변경사항 커밋** — 스크롤 버그 수정과 README 재작성은 별도 커밋이 자연스러움
4. **README 스크린샷 추가** — `README.md`의 "Demo / Screenshots" 섹션에 실제 스크린샷 이미지 추가 (현재 placeholder)
5. **git push** — 로컬 커밋(이전 2개 + 새 커밋)을 `origin/main`에 push

---

## 7. 주의사항

- **Author GitHub URL**: 유저가 `README.md` Author 섹션의 GitHub URL을 `github.com/iimmuunnee`로 직접 수정함. 이 값을 변경하지 말 것.
- **SnapContainer는 layout 레벨**: `SnapContainer`는 `app/[locale]/layout.tsx`에서 렌더됨. Hall 간 이동 시 재마운트되지 않는 구조적 특성이 있으므로, 이 구조를 변경하면 스크롤 시스템 전체에 영향.
- **Fallback 데이터**: 프론트엔드는 백엔드 없이도 `lib/api.ts`의 `getDemoData()` fallback 데이터로 동작함. 백엔드(`uvicorn app:app --port 8080`) 없이 프론트엔드만 테스트 가능.
