import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Bot, Check, ChevronDown, CircleAlert, CornerDownLeft, LoaderCircle, MapPin, MessageCircle, Plane, RotateCcw, Send, ShieldCheck, Sparkles, Trash2, UserRound, WifiOff } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { authErrorMessage } from '../../services/authService'
import { assistantService } from '../../services/assistantService'
import { tripService, type Trip } from '../../services/tripService'

type ChatMessage = { id: number; role: 'assistant' | 'user'; text: string; source?: 'local_rules' | 'open_meteo'; limitations?: string[] }
type RetryRequest = { message: string; tripId?: string }

const generalQuestions = [
  'How can I save money on this trip?',
  'What should I pack?',
  'Explain my itinerary.',
  'Suggest activities for my family.',
  'How should I plan my travel day?',
  'Give me local food suggestions.',
]
const welcomeMessage = 'Hi! I’m your TravelMate assistant. I use local travel-planning rules, not a language model or live travel feeds. Choose a trip for personalized help, or ask a general travel question.'

function ReplyText({ text }: { text: string }) {
  return <div className="space-y-2 text-sm leading-6 text-slate-200">{text.split('\n').map((line, index) => {
    if (line.startsWith('## ')) return <h3 key={index} className="pt-1 text-sm font-semibold text-white">{line.slice(3)}</h3>
    if (line.startsWith('- ')) return <p key={index} className="flex gap-2 pl-1"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-300"/><span>{line.slice(2)}</span></p>
    if (!line.trim()) return <div key={index} className="h-1" />
    return <p key={index}>{line}</p>
  })}</div>
}

function ChatMessageView({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant'
  return <article className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`} aria-label={isAssistant ? 'Assistant message' : 'Your message'}>
    <span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-xl border ${isAssistant ? 'border-cyan-200/15 bg-cyan-200/[0.08] text-cyan-100' : 'border-indigo-200/15 bg-indigo-300/10 text-indigo-100'}`}>{isAssistant ? <Bot size={17}/> : <UserRound size={16}/>}</span>
    <div className={`min-w-0 max-w-[min(88%,720px)] rounded-2xl border px-4 py-3.5 ${isAssistant ? 'border-white/[0.08] bg-[#0c1728]' : 'border-indigo-200/15 bg-indigo-500/15'}`}>
      {isAssistant ? <ReplyText text={message.text}/> : <p className="whitespace-pre-wrap text-sm leading-6 text-white">{message.text}</p>}
      {isAssistant && message.limitations && message.limitations.length > 0 && <p className="mt-3 border-t border-white/[0.07] pt-2 text-[11px] leading-5 text-slate-500">{message.limitations.join(' ')}</p>}
      {isAssistant && <p className="mt-2 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.16em] text-cyan-200/60"><Check size={10}/>{message.source === 'open_meteo' ? 'Recent Open-Meteo data' : 'Local travel guidance'}</p>}
    </div>
  </article>
}

export function AssistantPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripLoading, setTripLoading] = useState(true)
  const [tripError, setTripError] = useState('')
  const [tripId, setTripId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, role: 'assistant', text: welcomeMessage }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [retryRequest, setRetryRequest] = useState<RetryRequest | null>(null)
  const [messageId, setMessageId] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    void tripService.getTrips().then((items) => { if (active) setTrips(items) }).catch((cause) => { if (active) setTripError(authErrorMessage(cause)) }).finally(() => { if (active) setTripLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, sending, error])

  async function requestReply(request: RetryRequest, appendUser: boolean) {
    setSending(true)
    setError('')
    setRetryRequest(null)
    if (appendUser) setMessages((current) => [...current, { id: messageId, role: 'user', text: request.message }])
    setMessageId((current) => current + 1)
    try {
      const response = await assistantService.chat(request.message, request.tripId)
      setMessages((current) => [...current, { id: messageId + 1, role: 'assistant', text: response.reply, source: response.source, limitations: response.limitations }])
    } catch (cause) {
      setError(authErrorMessage(cause))
      setRetryRequest(request)
    } finally { setSending(false) }
  }

  function send(text = draft) {
    const message = text.trim()
    if (!message || sending || message.length > 1000) return
    setDraft('')
    void requestReply({ message, ...(tripId ? { tripId } : {}) }, true)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); send() }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() }
  }

  function clearConversation() {
    setMessages([{ id: messageId + 2, role: 'assistant', text: welcomeMessage }])
    setMessageId((current) => current + 3)
    setError('')
    setRetryRequest(null)
  }

  const selectedTrip = trips.find((trip) => trip._id === tripId)
  const questions = selectedTrip ? generalQuestions.map((question) => question.replace('this trip', `my ${selectedTrip.destination} trip`)) : generalQuestions

  return <Container className="py-7 sm:py-10"><div className="mx-auto max-w-6xl">
    <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_80%_0%,rgba(34,211,238,.12),transparent_32%),radial-gradient(ellipse_at_15%_100%,rgba(99,102,241,.16),transparent_38%),#0a1220] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-100/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.19em] text-cyan-100"><Sparkles size={13}/>Free · Local rules</span><h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">AI Travel Assistant</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Practical planning help using your selected trip and saved itinerary. Responses are generated locally with travel rules, not a live AI or booking service.</p></div><span className="hidden size-14 place-items-center rounded-2xl border border-indigo-200/15 bg-indigo-300/10 text-indigo-100 sm:grid"><Plane size={23}/></span></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(240px,1fr)_auto] sm:items-end"><label className="block text-xs font-semibold text-slate-300">Use a trip for context<span className="mt-1 block font-normal text-slate-500">Only your own trips are available here.</span><span className="relative mt-2 block"><select aria-label="Choose trip context" value={tripId} onChange={(event) => setTripId(event.target.value)} disabled={tripLoading || sending} className="min-h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#07101c] px-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-200/40 disabled:opacity-60"><option value="">General travel advice</option>{trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title} · {trip.destination}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-slate-400"/></span></label>
        <div className="flex items-center justify-between gap-3 sm:justify-end"><div className="inline-flex items-center gap-2 text-xs text-emerald-200/80"><ShieldCheck size={15}/>Private trip context</div><button type="button" onClick={clearConversation} disabled={sending} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14}/>Clear chat</button></div></div>
      {tripError && <p role="status" className="mt-3 text-xs text-amber-200">Your trip list could not be loaded. General assistant chat is still available. <button type="button" onClick={() => { setTripLoading(true); setTripError(''); void tripService.getTrips().then(setTrips).catch((cause) => setTripError(authErrorMessage(cause))).finally(() => setTripLoading(false)) }} className="underline underline-offset-2">Retry</button></p>}
    </header>

    <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070d17] shadow-[0_25px_70px_rgba(0,0,0,.22)]" aria-label="Travel assistant chat">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3.5 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-cyan-200/[0.08] text-cyan-100"><MessageCircle size={17}/></span><div><p className="text-sm font-semibold text-white">Travel planning chat</p><p className="mt-0.5 text-[10px] text-slate-500">{selectedTrip ? <span className="inline-flex items-center gap-1"><MapPin size={10}/>{selectedTrip.destination} · {selectedTrip.travelers} {selectedTrip.travelers === 1 ? 'traveler' : 'travelers'}</span> : 'General context'}</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/10 bg-emerald-200/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.13em] text-emerald-100"><WifiOff size={11}/>No live data</span></div>

      <div className="max-h-[58vh] min-h-[350px] space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6" aria-live="polite" aria-relevant="additions text">
        {messages.map((message) => <ChatMessageView key={message.id} message={message}/>)}
        {sending && <div role="status" className="flex items-center gap-3 text-xs text-slate-400"><span className="grid size-9 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-200/[0.08] text-cyan-100"><Bot size={17}/></span><span className="inline-flex items-center gap-2"><LoaderCircle size={13} className="animate-spin text-cyan-200"/>Putting together a local answer…</span></div>}
        {error && <div role="alert" className="ml-12 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] p-3 text-xs text-rose-100"><div className="flex items-center gap-2"><CircleAlert size={14}/>{error}</div>{retryRequest && <button type="button" onClick={() => void requestReply(retryRequest, false)} disabled={sending} className="mt-2 inline-flex min-h-8 items-center gap-1.5 font-semibold underline underline-offset-2 disabled:opacity-50"><RotateCcw size={12}/>Retry message</button>}</div>}
        <div ref={bottomRef}/>
      </div>

      <div className="border-t border-white/[0.07] bg-[#090f1b] px-4 py-4 sm:px-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Suggested questions</p><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{questions.map((question) => <button type="button" key={question} onClick={() => send(question)} disabled={sending} className="min-h-9 shrink-0 rounded-full border border-white/[0.09] bg-white/[0.02] px-3 text-[11px] text-slate-300 transition hover:border-cyan-200/25 hover:bg-cyan-200/[0.05] hover:text-white disabled:opacity-50">{question}</button>)}</div>
        <form onSubmit={onSubmit} className="rounded-2xl border border-white/[0.1] bg-[#050a12] p-2 focus-within:border-cyan-200/30"><label htmlFor="assistant-message" className="sr-only">Your travel question</label><div className="flex items-end gap-2"><textarea id="assistant-message" rows={2} maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} placeholder="Ask about your trip or travel planning…" disabled={sending} className="max-h-36 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600 disabled:opacity-60"/><button type="submit" disabled={sending || !draft.trim()} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-45"><Send size={14}/><span className="hidden sm:inline">Send</span></button></div><div className="flex items-center justify-between px-2 pb-1 pt-1 text-[9px] text-slate-600"><span className="inline-flex items-center gap-1"><CornerDownLeft size={10}/>Enter to send · Shift+Enter for new line</span><span>{draft.length}/1000</span></div></form>
        <p className="mt-2 text-center text-[10px] leading-5 text-slate-600">Local guidance can be incomplete. Confirm current travel details with official providers.</p>
      </div>
    </section>
  </div></Container>
}
