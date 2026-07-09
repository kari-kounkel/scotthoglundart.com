import { Acorn } from '../components/Daisy'

/* Read-only copy of the Sales & Fulfillment Agreement, shown on Scott's
   admin so he can review the terms anytime. The signable Word document is
   kept by CARES Consulting Inc | K Co LLC. */

const H = ({ children }) => (
  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 400, color: 'var(--bark)', margin: '1.6rem 0 0.5rem' }}>{children}</h3>
)
const P = ({ children }) => (
  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--bark-light)', marginBottom: '0.6rem' }}>{children}</p>
)
const LI = ({ children }) => (
  <li style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--bark-light)', marginBottom: '0.35rem' }}>{children}</li>
)
const B = ({ children }) => <strong style={{ color: 'var(--bark)' }}>{children}</strong>

export default function AdminAgreement() {
  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 2px 12px var(--shadow)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #e0d8ca', paddingBottom: '1.2rem', marginBottom: '1.4rem' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontWeight: 400 }}>Art Sales &amp; Fulfillment Agreement</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--stone)', marginTop: '0.3rem' }}>
          Scott Hoglund Art · Effective July 15, 2026 · Between <B>CARES Consulting Inc | K Co LLC</B> (“Manager”) and <B>Scott Hoglund</B> (“Artist”)
        </p>
      </div>

      {/* At a glance */}
      <div style={{ background: 'var(--warm-cream)', border: '1px solid #e0d8ca', borderRadius: '5px', padding: '1.2rem 1.4rem', marginBottom: '1.6rem' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--clay)', marginBottom: '0.6rem' }}>
          <Acorn size={16} color="var(--clay)" /> The deal at a glance
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          <LI><B>Kari (CARES Consulting Inc | K Co LLC)</B> runs the website, Printify, and Stripe.</LI>
          <LI>Every sale is collected into the Manager’s account. The Manager pays the costs (card fees, printing, shipping).</LI>
          <LI><B>Management fee: 10%</B> of the Net Proceeds on each sale.</LI>
          <LI><B>You (Scott) are paid the rest</B> — the Net Proceeds after costs and the 10% fee.</LI>
          <LI>Paid <B>monthly</B>, within 15 days of month-end. Refunds/chargebacks come out of the next payment.</LI>
          <LI>Custom commissions start with a <B>50% deposit</B>.</LI>
          <LI>You always keep the copyright to your art. Either of us can end this with 30 days’ notice.</LI>
        </ul>
      </div>

      <H>1. What each person does</H>
      <P><B>Kari (Manager)</B> builds and maintains the website, runs the Printify and Stripe accounts, processes payments, arranges printing and shipping, handles customer service and returns, keeps the records, and pays you your share.</P>
      <P><B>Scott (Artist)</B> provides the artwork and files, approves which pieces become products, approves custom commissions (scope, price, timeline) before work begins, and delivers commissioned work as agreed.</P>

      <H>2. Who owns the artwork</H>
      <P>You keep all ownership and copyright in your artwork — nothing here transfers that. You give the Manager permission to display, print, and sell your work through the website and Printify while this agreement is active; that permission ends when the agreement ends. Original physical pieces stay yours until they’re sold.</P>

      <H>3. What’s sold, and prices</H>
      <P>Print-on-demand items (postcards, prints, posters), custom commissions, and original works. Retail prices are set by the Manager together with you.</P>

      <H>4. How the money flows</H>
      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <LI>All customer payments run through the Manager’s Stripe account into the Manager’s bank account.</LI>
        <LI>The Manager pays the <B>direct costs of each sale</B>: processing fees, Printify printing, and shipping — plus any refund or chargeback on that sale.</LI>
        <LI>The Manager also covers the cost of running the storefront (site, hosting, database, Printify). You’re not billed separately for these.</LI>
      </ul>

      <H>5. The Manager’s fee and your payment</H>
      <P><B>“Net Proceeds”</B> = what the customer paid, minus the processing fee, printing, shipping, and any refund/chargeback on that sale.</P>
      <P><B>Manager’s fee:</B> for running everything, the Manager earns <B>10% of the Net Proceeds</B> of each sale.</P>
      <P><B>Your payment:</B> you receive the Net Proceeds minus the 10% fee, paid <B>monthly, within 15 days after the end of each month</B>, by check or bank transfer.</P>
      <P><B>Returns &amp; chargebacks:</B> if a sale is refunded or charged back after you’ve been paid for it, that amount is subtracted from your next payment — so no separate reserve is held back.</P>

      <H>6. Transparency — how you can verify the numbers</H>
      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <LI>Every payout comes with a statement listing each order — item, what the customer paid, processing fee, printing, shipping, the Manager’s fee, and your payment.</LI>
        <LI>Each statement is backed by the real Stripe and Printify records; the Manager shares copies on request and you may review them anytime.</LI>
        <LI>You have this admin login, where you can watch every order arrive live — the same orders that appear on the statement.</LI>
        <LI>The Manager may also give you read-only access to the Stripe and/or Printify dashboards.</LI>
        <LI>Records are kept at least 3 years, and either of us can ask for a full reconciliation once a year.</LI>
      </ul>

      <H>7. Custom commissions</H>
      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <LI>A customer submits a request (with a reference image) through the website.</LI>
        <LI>You review and approve the scope, price, and timeline before any work begins.</LI>
        <LI>A <B>50% deposit</B> starts the work; the balance is due before the finished piece ships.</LI>
        <LI>If you begin and the customer cancels, the deposit covers your time/materials. If you can’t complete it, the deposit is refunded.</LI>
      </ul>

      <H>8. Taxes and independent status</H>
      <P>You and the Manager are independent — not partners or employer/employee. Because payments are collected through the Manager’s account, the Manager’s business receives the Stripe 1099-K, and will issue you a 1099-NEC if your payments meet the IRS threshold. Each of you handles your own taxes. (This is a plain-language working agreement, not legal or tax advice.)</P>

      <H>9. How long it lasts, and ending it</H>
      <P>Starts July 15, 2026 and continues until ended. Either party may end it with 30 days’ written notice (email is fine). When it ends: your work comes off the store, any approved commission in progress is finished (or its deposit refunded), a final accounting and payout is sent within 30 days, the license ends, and unsold originals are returned to you.</P>

      <H>10. Refunds, returns &amp; customer info</H>
      <P>The Manager handles customer service, refunds, and returns per the store’s policy; those costs are subtracted before your share. Customer information is handled by the Manager and used only to fulfill orders and, where a customer opts in, send updates.</P>

      <H>11. Odds and ends</H>
      <P>This is the whole agreement on this subject; changes must be in writing and signed by both; if a part is unenforceable the rest still applies; governed by Minnesota law.</P>

      <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid #e0d8ca', fontSize: '0.8rem', color: 'var(--stone)', lineHeight: 1.6 }}>
        This is your reference copy to read anytime. The official document for signing is kept by CARES Consulting Inc | K Co LLC — ask Kari for a copy or with any questions.
      </div>
    </div>
  )
}
