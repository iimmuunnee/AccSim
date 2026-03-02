# HANDOFF — UI/UX 추가 수정 + 줄바꿈 제어 구조 개선

## 작업 일시
2026-03-02

## 완료된 작업

### 1. HALL 4 Term 툴팁 불투명 + 고대비 (✅ 이전 세션에서 완료)
- **파일**: `tailwind.config.ts`, `src/components/ui/Term.tsx`
- **내용**: 툴팁 배경 불투명(`bg-surface-tooltip`, `#2D2D35`), 테두리 2px(`border-2 border-border-tooltip`, `#5A5A66`), 강한 그림자(`shadow-[0_8px_32px_rgba(0,0,0,0.7)]`), 텍스트 고대비(`text-text-primary/90`), 폭 확대(`w-72`), 라운딩(`rounded-xl`), `backdrop-blur-none`
- **상태**: 이미 적용됨, 이번 세션에서 확인만 완료

### 2. HALL 7 아키텍처 다이어그램 확대 (✅ 완료)
- **파일**: `src/components/halls/ArchitectureHall.tsx`
- **변경 사항**:
  - 레이아웃: `grid grid-cols-1 lg:grid-cols-2` → 다이어그램 풀와이드 상단 + 디테일 패널 하단
  - SVG: `viewBox="0 0 640 400"` height 400 → `viewBox="0 0 800 460"` height 520
  - 노드 좌표 전부 재배치 (w/h 20~30% 증가)
  - fontSize: 12 → 14, rx: 8 → 10, marker 크기 확대
  - 디테일 패널: flex 가로 배치 (아이콘 + 텍스트), 아래에서 위로(`y: 16`) 애니메이션
  - strokeWidth 강화 (선택 시 2 → 2.5)

### 3. Nl2Br 공통 줄바꿈 유틸리티 (✅ 완료)
- **신규 파일**: `src/components/ui/Nl2Br.tsx`
- **내용**: `\n`을 `<br />`로 변환하는 인라인 컴포넌트. `whitespace-pre-line` CSS 대안으로, 어떤 부모 컨테이너에서든 동일하게 동작.
- **사용법**: `<Nl2Br text={t('someKey')} />`

### 4. ChipHall subtitle whitespace-pre-line 추가 (✅ 완료)
- **파일**: `src/components/halls/ChipHall.tsx` (44행)
- **내용**: subtitle `<p>` 태그에 `whitespace-pre-line` 클래스 추가 (누락되어 있었음)

## 빌드 검증
- `npx next build` ✅ 성공 (에러 없음)

## 시도했으나 실패한 것
- 없음. 모든 작업 계획대로 성공.

## 다음 단계 (미수행)
1. **시각 테스트**: `npm run dev`로 실행하여 실제 화면에서 확인 필요
   - HALL 4: ISA/Tiling/SRAM hover 시 툴팁이 불투명하고 텍스트가 선명한지
   - HALL 7: 아키텍처 다이어그램이 화면 전체 폭을 활용하는지
   - HALL 3(ChipHall): subtitle에서 `\n` 줄바꿈이 정상 표시되는지
2. **Nl2Br 적용 확대**: 현재는 생성만 됨. 새 코드 작성 시 `<Nl2Br>` 사용 권장. 기존 `whitespace-pre-line` 방식은 그대로 유지.
3. **커밋**: 변경 사항을 git commit (아직 커밋하지 않음)

## 변경된 파일 목록
| 파일 | 상태 |
|------|------|
| `src/components/halls/ArchitectureHall.tsx` | 수정 (풀와이드 + 노드 확대) |
| `src/components/ui/Nl2Br.tsx` | 신규 생성 |
| `src/components/halls/ChipHall.tsx` | 수정 (whitespace-pre-line 추가) |
| `tailwind.config.ts` | 이전 세션에서 수정 완료 |
| `src/components/ui/Term.tsx` | 이전 세션에서 수정 완료 |
