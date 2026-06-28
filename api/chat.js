export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const PAPER_CONTEXT = `
RESEARCH PAPER: "Income Transfer Policies and Aggregate Welfare: Evidence from India"
Authors: Samarth Gupta (IIM Calcutta) & Vaishnavi Krishna Mohan (University of Chicago), June 2026
Data: All India Debt and Investment Survey (AIDIS) 2019, 1,15,857 households

=== KEY FINDINGS ===

1. MPC BY CASTE:
- SC: MPC = 0.795 (highest) — Rs.79.5 spent per Rs.100 transferred
- ST: MPC = 0.683
- OBC: MPC = 0.751
- General: MPC = 0.529 (lowest)
- Rural MPC (0.724) > Urban (0.622)
- MPC declines with consumption level and with age
- MPC variation driven by occupational/income risks, NOT financial market frictions

2. UTILITY PARAMETERS:
- SC: alpha=0.947, delta=0.962
- ST: alpha=0.892, delta=0.967
- OBC: alpha=0.882, delta=0.962
- General: alpha=0.854, delta=0.971

3. WELFARE IMPACTS:
- Progressive Transfers: +0.676% (BEST — 9% more than UBI)
- UBI Rs.1122/household: +0.656%
- Socio-economic Redistribution: +0.072% (BEST budget-neutral)
- Social Group Redistribution (caste-only): +0.031%
- Economic Redistribution only: +0.022%
- Gender-based Redistribution: -0.008% (slightly negative)

4. POLICY DETAILS:
- UBI: Rs.1122 to all, external funding, no targeting needed
- Progressive: inversely proportional to consumption, same total cost as UBI
- Social Group Redistribution: Rs.1122 to SC/ST/OBC, tax Rs.2681 on General households
- Socio-economic Redistribution: Rs.1122 to SC/ST/OBC below-median consumption, tax Rs.636 on above-median General households
- Gender Redistribution: Rs.1122 to female-headed HH, tax Rs.170.83 on male-headed HH

5. CONSUMPTION CHANGE (avg per household):
- UBI: +Rs.766
- Progressive: +Rs.837
- Redistribution (economic): +Rs.35
- Social Group Redistribution: +Rs.173
- Socio-economic Redistribution: +Rs.98
- Gender Redistribution: +Rs.0.37

6. WHY CASTE ALONE IS INSUFFICIENT:
- Significant overlap in wealth/consumption across castes
- General caste poor households exist — taxing them reduces welfare
- SC/ST wealthy households exist — transfers give low marginal utility
- Social and economic deprivation are cross-cutting, not perfectly correlated

7. CORE INSIGHT:
Flat transfers (e.g., Rs.2000 to all women) are suboptimal. An SC woman with MPC=0.795 gains far more utility per rupee than a General category affluent woman with MPC=0.529. Progressive or socio-economic targeting maximizes welfare per rupee.

8. PRACTICAL IMPLEMENTATION:
- With external budget: use Progressive Transfers
- Budget-neutral: use Socio-economic Redistribution (caste + consumption bracket)
- DO NOT rely on caste alone — cross-verify with consumption/BPL data
- Rural areas have higher MPC — prioritize rural transfers
- Younger household heads have higher MPC
- Data needed: BPL/ration card status + caste certificate

9. AIDIS 2019 SUMMARY STATS:
- ST: avg consumption Rs.9,229, avg wealth Rs.2,19,418
- SC: avg consumption Rs.9,645, avg wealth Rs.1,27,296
- OBC: avg consumption Rs.10,731, avg wealth Rs.1,67,735
- General: avg consumption Rs.13,653, avg wealth Rs.4,43,624
`;

  const SYSTEM_PROMPT = `You are a policy assistant helping IAS officers implement income transfer schemes in India, based on the research paper "Income Transfer Policies and Aggregate Welfare: Evidence from India" by Gupta & Krishna Mohan (2026).

Rules:
1. Answer ONLY from the paper context. If not in paper, say so.
2. Be practical and field-implementable. Plain language only.
3. Always tie back to the core insight: poor households with high MPC benefit more per rupee.
4. Cite specific numbers. Format clearly with bullets for lists.
5. Never recommend pure gender-based redistribution as primary scheme.
6. When district context is given, tailor advice specifically.

${PAPER_CONTEXT}`;

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.content?.[0]?.text || 'No response received.' });
  } catch (err) {
    res.status(500).json({ error: 'API call failed', detail: err.message });
  }
}
