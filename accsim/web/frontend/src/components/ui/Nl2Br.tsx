import { Fragment } from 'react'

interface Props {
  text: string
}

/** \n을 <br />로 변환하는 인라인 컴포넌트. whitespace-pre-line 대체용. */
export default function Nl2Br({ text }: Props) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}
