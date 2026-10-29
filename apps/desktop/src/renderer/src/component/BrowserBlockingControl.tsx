import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { BrowserBlockStatus } from '../../../shared/browserBlocking'
import Container from './Container'
import Icon from './ui/Icon'

export function BrowserBlockingSummary() {
  const navigate = useNavigate()
  return (
    <Section>
      <button type="button" onClick={() => navigate('/blocking')}>
        <span>집중 중 사이트 차단</span>
        <Icon name="chevron" size={16} />
      </button>
    </Section>
  )
}
export function BrowserBlockingPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<BrowserBlockStatus>({
    enabled: false,
    domains: [],
    connected: false,
    active: false
  })
  const [draft, setDraft] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    let active = true
    const refresh = () =>
      void window.electron
        ?.browserBlockStatus?.()
        .then((value) => {
          if (!active) return
          setStatus(value)
          setLoaded(true)
        })
        .catch(() => {
          if (active) setError('Chrome 연결을 확인할 수 없어요.')
        })
    refresh()
    const timer = setInterval(refresh, 2000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    if (loaded) setDraft(status.domains.join('\n'))
  }, [loaded, status.domains.join('|')])
  const save = async (enabled: boolean) => {
    if (!window.electron?.browserBlockConfigure) {
      setError('PC 앱에서 사이트 차단을 연결할 수 있어요.')
      return
    }
    try {
      setStatus(
        await window.electron.browserBlockConfigure({
          enabled,
          domains: enabled
            ? draft
                .split(/[\n,]+/)
                .map((s) => s.trim())
                .filter(Boolean)
            : status.domains
        })
      )
      setError('')
    } catch {
      setError('사이트 주소를 확인해주세요. 최대 30개까지 선택할 수 있어요.')
    }
  }
  return (
    <Container width={402}>
      <Container.Top height={30}>
        <div />
      </Container.Top>
      <Container.Body height={466} padding="12px 22px">
        <Panel>
          <Header>
            <button
              type="button"
              aria-label="설정으로 돌아가기"
              onClick={() => navigate('/settings')}
            >
              <Icon name="undo" size={20} />
            </button>
            <h1>집중 중 사이트 차단</h1>
          </Header>
          <p>Chrome에서 선택한 사이트만 차단해요. 마침·일시정지·앱 종료 시 바로 해제해요.</p>
          <label htmlFor="blocked-domains">차단할 사이트</label>
          <textarea
            id="blocked-domains"
            placeholder={'youtube.com\n사이트를 한 줄에 하나씩'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
          <p role="status">
            {error ||
              status.error ||
              (status.active
                ? '선택한 사이트를 차단하고 있어요.'
                : status.connected
                  ? 'Chrome 연결됨 · 집중하면 허용한 사이트를 차단해요.'
                  : 'Chrome 확장을 연결해주세요.')}
          </p>
          <button
            type="button"
            onClick={() => {
              if (!window.electron?.browserBlockOpenExtension) {
                setError('PC 앱에서 Chrome 확장 폴더를 열 수 있어요.')
                return
              }
              void window.electron
                .browserBlockOpenExtension()
                .catch(() => setError('확장 폴더를 열지 못했어요.'))
            }}
          >
            Chrome 확장 폴더 열기
          </button>
          <small>
            Chrome 확장 관리에서 개발자 모드를 켜고, 열린 폴더를 ‘압축해제된 확장 프로그램 로드’로
            선택하세요.
          </small>
          <button
            type="button"
            onClick={() => {
              void window.electron
                ?.browserBlockCopyCode?.()
                .then(() => setCopied(true))
                .catch(() => setError('연결 코드를 복사하지 못했어요.'))
            }}
          >
            {copied ? '연결 코드 복사됨' : 'Chrome 연결 코드 복사'}
          </button>
          <small>확장의 연결 칸에 붙여넣으세요. 방문 기록은 수집하지 않아요.</small>
        </Panel>
      </Container.Body>
      <Container.Bottom height={48}>
        <Container.Button
          onClick={() => {
            void save(false)
          }}
        >
          차단 끄기
        </Container.Button>
        <Container.Button
          onClick={() => {
            void save(true)
          }}
          disabled={!draft.trim()}
        >
          저장하고 차단 켜기
        </Container.Button>
      </Container.Bottom>
    </Container>
  )
}
const Section = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ffffff12;
  button {
    background: none;
    border: 0;
    color: #eee;
    padding: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    cursor: pointer;
  }
`
const Panel = styled.div`
  width: 100%;
  color: #eee;
  h1 {
    font-size: 16px;
    margin: 0;
  }
  p {
    font-size: 12px;
    line-height: 1.7;
    color: #bbb;
    margin: 16px 0;
  }
  label {
    font-size: 12px;
    display: block;
    margin-bottom: 8px;
  }
  textarea {
    box-sizing: border-box;
    width: 100%;
    height: 104px;
    resize: none;
    background: #ffffff08;
    color: #eee;
    border: 1px solid #777;
    border-radius: 7px;
    padding: 10px;
    font: 13px/1.6 inherit;
  }
  textarea::placeholder {
    color: #aaa;
  }
  button {
    background: none;
    border: 0;
    color: #eee;
    text-decoration: underline;
    text-underline-offset: 4px;
    padding: 0;
    cursor: pointer;
    font-size: 12px;
  }
  small {
    display: block;
    color: #aaa;
    font-size: 11px;
    line-height: 1.6;
    margin: 8px 0 12px;
  }
  :is(button, textarea):focus-visible {
    outline: 2px solid white;
    outline-offset: 3px;
  }
`
const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  button {
    display: flex;
  }
`
