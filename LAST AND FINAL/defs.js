// Plain-language meaning of every category shown in the charts, used by the small “i” next to each bar label.
(function () {
  const NA = 'Non-Actionable Calls';
  const NA_T = 'Calls with too little two-way conversation for the AI to judge (too short, no speech or voicemail). Counted so the bars add up to all calls.';
  const PARAM = {
    p_open: 'Avoid Delay in Opening — the agent starts speaking promptly once the customer answers (no long silence at the start). Judged by the AI on the transcript.',
    p_greet: 'Greeting & Introduction — the agent greets the customer, gives their own name and Capri Global, and confirms who they are speaking to.',
    p_purpose: 'Purpose of the Call — the agent clearly states why they are calling (EMI due, amount, date) early in the call.',
    p_queries: 'Did the Agent Understand & Address All Customer Queries/Concerns — every question the customer raised was understood and answered.',
    p_info: 'Complete & Correct Information Provided — amounts, dates and payment options given to the customer were complete and accurate.',
    p_probe: 'Necessary Probing Done — the agent asked why the payment is late and when funds will be available.',
    p_objection: 'Ownership & Effective Objection Handling — the agent handled the customer’s objections and steered back to a payment commitment.',
    p_tone: 'Tone, Articulation, Professional Language, ROS — calm, clear, respectful language and a proper rate of speech.',
    p_listen: 'Active Listening — the agent let the customer speak and responded to what they actually said.',
    p_empathy: 'Empathy / Apology / Personalization / Acknowledgement — the agent acknowledged the customer’s situation before pushing for payment.',
    p_hold: 'Dead Air/Hold/Conference Procedure Followed — no long silences; hold only with permission and returning promptly.',
    p_dispo: 'Correct Disposition Tagged — the outcome the agent recorded matches what actually happened on the call. A wrong tag is a fatal error.',
    p_proactive: 'Demonstrated Proactive Effort to Drive Desired Action — the agent asked for a specific amount and date and pushed for the payment.',
    p_closing: 'Closing — the agent summarised the promise (amount, date, mode) and closed the call properly.',
    p_ethics: 'ZT - Adherence of Conduct & Ethics — zero tolerance: no threats, pressure or misleading statements. A breach is fatal.',
    p_datasec: 'Data Security / Non-Disclosure Breached — loan details shared with the wrong person or without verifying identity.',
    p_aprof: 'Agent Profanity — the agent used abusive or offensive language.',
  };
  const D = {
    _: { [NA]: NA_T, 'Not Applicable': 'The AI could not apply this judgement to the call, e.g. the customer was a third party or the call was not about repayment.', 'Not applicable': 'The AI could not apply this judgement to the call, e.g. a third party answered or the call was not about repayment.' },
    intent: {
      High: 'Customer clearly wants to pay and indicated they will, e.g. agreed a date or said they will clear it soon. AI judgement from the conversation.',
      Medium: 'Customer is somewhat willing but non-committal or conditional (“will try”, “after salary”). AI judgement.',
      Low: 'Customer shows little willingness to pay — avoids commitment, deflects or delays. AI judgement.',
      'No intent to Repay': 'Customer says they will not pay or refuses outright. AI judgement.',
    },
    cap: {
      'High capability': 'Customer appears to have the funds available now (salary received, money in account). AI judgement.',
      'Medium capability': 'Customer can pay part, or will have funds soon. AI judgement.',
      'Low capability': 'Customer indicates real difficulty finding the money. AI judgement.',
      'No capability': 'Customer says they have no means to pay at present (e.g. job loss). AI judgement.',
      Unclear: 'The conversation did not reveal whether the customer can pay.',
    },
    reason: {
      'Awareness / Intentional': 'Customer forgot the due date, was unaware of it, or deliberately chose to delay paying.',
      'Banking/Account Issue': 'Payment failed or is pending because of the bank: mandate/NACH problem, insufficient balance, account issues.',
      Dispute: 'Customer disputes the EMI amount, charges or loan terms.',
      'Emergency / Life Event': 'Medical emergency, bereavement or another personal crisis.',
      'Income Related': 'Salary delayed, income reduced or job lost.',
      'Other/ Unspecified': 'No clear reason for non-payment came out on the call (often a probing gap).',
    },
    rsub: {
      'Account / Mandate Issue': 'Auto-debit (NACH) mandate failed, not registered or the account has a problem.',
      'Insufficient Balance': 'Not enough money in the account when the EMI was presented.',
      'Deliberate Deferral': 'Customer chose to delay payment on purpose.',
      'Forgot or Unaware about the EMI due date': 'Customer forgot or did not know the EMI was due.',
      'EMI Amount Dispute': 'Customer disagrees with the EMI amount being asked.',
      'Loan Term & servicing due': 'Customer raises issues with loan terms or servicing charges.',
      Bereavement: 'A death in the family.',
      'Medical Emergency': 'Illness or medical expense in the family.',
      'Job Loss / Unemployement': 'Customer has lost their job or source of income.',
      'Salary / Income Delay': 'Salary or business income has not arrived yet.',
      Inconclusive: 'A reason was hinted at but could not be pinned down.',
      'Other / not specified': 'Calls in this reason group where no specific reason was named.',
    },
    sent: {
      Negotiating: 'Customer is bargaining — asking for more time, a smaller amount or a waiver.',
      Curious: 'Customer is asking questions to understand the dues or the process.',
      Defensive: 'Customer is justifying or defending the delay.',
      Helpless: 'Customer sounds unable to cope or resolve the situation.',
      Frustrated: 'Customer is annoyed or fed up (with the calls, the bank or the situation).',
      Angry: 'Customer is openly angry or hostile.',
      Confused: 'Customer does not understand the dues, the call or the process.',
      Unclear: 'The customer’s mood could not be determined.',
    },
    settle: { 'Discussed about settlement': 'Settling the loan (closing it for a negotiated amount) was discussed on the call.', 'No discussion on settlement': 'Settlement was not discussed.' },
    waiver: { 'Waiver Pitched': 'A waiver of charges or penalty was offered or discussed.', 'Waiver not pitched': 'No waiver was offered or discussed.' },
    aggr: {
      Assertive: 'Agent was firm and clear about the dues and consequences, while staying professional.',
      Medium: 'Agent was balanced — polite with a reasonable push for payment.',
      Submissive: 'Agent was too soft — accepted delays or excuses without pushing for a commitment.',
    },
    langeff: {
      High: 'Agent communicated clearly and effectively in the customer’s language.',
      Medium: 'Agent was understandable but not fully clear or fluent.',
      Low: 'Agent’s language made the conversation unclear or hard to follow.',
    },
    threat: {
      'No threat': 'The agent made no threats.',
      'Home visit Threat': 'Agent threatened to send someone to the customer’s home. A compliance breach.',
      'Legal Threat': 'Agent threatened legal action. A compliance breach.',
      'Court Threat': 'Agent threatened court proceedings. A compliance breach.',
      'Bank Threat': 'Agent threatened action through the customer’s bank. A compliance breach.',
      'Social Reputation Threat': 'Agent threatened to damage the customer’s reputation (e.g. contacting family or employer). A compliance breach.',
    },
    outcome: {
      'Promise To Pay': 'Customer committed to pay the EMI on a specific date.',
      'Penal PTP': 'Customer committed to pay penal (late) charges.',
      'NACH PTP': 'Customer committed to keep funds ready for the NACH auto-debit.',
      'Will Clear': 'Customer said the dues will be cleared soon, without a firm promise.',
      'Payment Done': 'Customer said the payment has already been made (not verified).',
      'Refuse To Pay': 'Customer refused to pay.',
      'Penal RTP': 'Customer refused to pay penal charges.',
      'Broken Promise To Pay': 'Customer had promised earlier but did not pay.',
      'Will Bounce': 'Customer expects the upcoming auto-debit to bounce.',
      'Will Close': 'Customer intends to close the loan.',
      Foreclose: 'Customer asked about or intends to foreclose (repay the loan early).',
      'Call Back': 'Customer asked to be called back later.',
      'Call Back or Follow up': 'A follow-up call is needed.',
      CBFU: 'Call back for follow-up.',
      'Call Back Hold': 'Call-back requested and on hold.',
      'Awareness Calling Done': 'An information/awareness call was completed (no payment ask).',
      'Third party': 'Someone other than the customer answered.',
      'Left Message': 'A message was left with someone or on the line.',
      'Call Drop': 'The call dropped before it finished.',
      'Call Disconnected': 'The call was disconnected (by either side).',
      'Wrong Number': 'The number does not belong to the customer.',
      'Death Case': 'The customer has passed away.',
      DND: 'Customer asked not to be called again.',
      'On Call Resolution': 'The customer’s issue was resolved on the call.',
      'Customer Visit branch for NACH': 'Customer will visit the branch to set up or fix NACH.',
      'Not Interested in NACH': 'Customer does not want to set up NACH auto-debit.',
    },
    sup: { OrgAdmin: 'No named supervisor is assigned to these agents in the system (default organisation admin).' },
    Lstage: {
      'Leads called': 'Every lead (loan account) with at least one call in the selection.',
      'Reached (connected call)': 'Leads with at least one connected, audited call.',
      'Promised to pay / will clear': 'Leads that promised to pay, said they will clear, or said they had paid on at least one call.',
      Paid: 'Leads where at least one call recorded Payment Done (customer said they paid).',
    },
    Lstatus: {
      Paid: 'The furthest this lead got: at least one call recorded Payment Done.',
      'Promised to pay': 'Best result was a promise to pay (incl. penal or NACH PTP); no payment recorded.',
      'Will clear': 'Best result was “will clear” without a firm promise.',
      'Callback / follow-up': 'Best result was a request to call back.',
      'Refused to pay': 'Best result was a refusal to pay.',
      'Other connected': 'Reached, but no payment-related outcome (e.g. third party, wrong number, awareness call).',
      'Not reached': 'No connected call with this lead yet.',
    },
    Latt: { '1 call': 'Leads called once.', '2 calls': 'Leads called twice.', '3 calls': 'Leads called three times.', '4–5 calls': 'Leads called four or five times.', '6+ calls': 'Leads called six or more times.' },
    Lemi: { 'Under ₹5k': 'Monthly EMI below ₹5,000.', '₹5k–10k': 'EMI from ₹5,000 to ₹9,999.', '₹10k–20k': 'EMI from ₹10,000 to ₹19,999.', '₹20k–50k': 'EMI from ₹20,000 to ₹49,999.', '₹50k and above': 'EMI of ₹50,000 or more.', Unknown: 'No EMI recorded on the loan.' },
    Lcycle: { 'Day 5': 'EMI falls due on the 5th of each month.', 'Day 10': 'EMI falls due on the 10th of each month.', Other: 'Any other or unrecorded due date.' },
  };
  for (const d of ['settle', 'waiver', 'aggr', 'langeff', 'threat', 'sent', 'intent', 'cap', 'reason', 'outcome']) D[d] = { ...D._, ...D[d] };
  for (const d of ['param', 'pfatal', 'freason', 'nfail']) D[d] = PARAM;
  for (const d of ['fsup', 'nsup']) D[d] = D.sup;
  D.reasonc = { ...D.reason, ...D.rsub, ...D._ };

  // definition for a bar: by dimension, then by its key or label
  window.CGdef = (dim, key, label) => {
    const m = D[dim];
    if (dim === 'campaign') return String(label).startsWith('PDM') ? `Awareness campaign (name starts with PDM): dialer campaign “${label}”. Awareness calls do not ask for payment, so their PTP rate is naturally low.` : `Collection campaign: dialer campaign “${label}”, calls that ask the customer to pay.`;
    if (!m) return null;
    return m[key] || m[label] || null;
  };

  // draw small “i” markers in a chart’s SVG; hovering one shows its definition
  window.CGinfoIcons = (el, svg, items) => {
    if (!items.length) return;
    let tip = el.querySelector(':scope > .cg-tip.cg-deftip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'cg-tip cg-deftip'; tip.hidden = true; el.appendChild(tip); }
    const g = svg.append('g').attr('class', 'cg-svgi-layer');
    for (const it of items) {
      const ic = g.append('g').attr('class', 'cg-svgi').attr('transform', `translate(${it.x},${it.y})`).attr('tabindex', 0).attr('role', 'img').attr('aria-label', it.text);
      ic.append('circle').attr('r', 6.5);
      ic.append('text').attr('text-anchor', 'middle').attr('y', 3.5).text('i');
      const show = (ev) => {
        tip.textContent = it.text; tip.hidden = false;
        const r = el.getBoundingClientRect();
        const ex = ev && ev.clientX != null ? ev.clientX - r.left : it.x, ey = ev && ev.clientY != null ? ev.clientY - r.top : it.y;
        let x = ex + 12, y = ey + 12;
        if (x + tip.offsetWidth > r.width) x = Math.max(0, ex - tip.offsetWidth - 12);
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
      };
      ic.on('pointermove', (ev) => { ev.stopPropagation(); show(ev); }).on('pointerleave', () => { tip.hidden = true; })
        .on('focus', () => show(null)).on('blur', () => { tip.hidden = true; })
        .on('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); show(ev); });
    }
  };
})();
