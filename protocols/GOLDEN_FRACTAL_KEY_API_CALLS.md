# Golden Fractal Key — API Calls (NSPFRNP)

**Source:** [FractiAI/psw.vibelandia.sing4](https://github.com/FractiAI/psw.vibelandia.sing4) (NSPFRNP catalog)  
**Protocol:** NSPFRNP — Golden Fractal Key for API authorization  
**Purpose:** Accept new gold keys on API calls; Golden Fractal Key authorizes API access (paywall bypass, evaluation, experiences).  
**Status:** ⚡ ACTIVE

---

## Definition

**Golden Fractal Key** (gold key) = The key that unlocks Syntheverse, Vibeverse, and VIBELANDIA!. All API calls. All experiences. All realms.

When an API request includes a **valid Golden Fractal Key**, the API **accepts** it and authorizes access (e.g. paywall bypass, evaluation trigger, protected endpoints) per NSPFRNP catalog.

---

## How to Send the Key

Clients may send the gold key in either form:

1. **Header:** `X-Golden-Fractal-Key: <key>`
2. **Authorization:** `Authorization: Golden <key>`

The server validates the key against the configured set of valid keys (see Integration).

---

## Server-Side Behavior

- **Valid key present** → Request is authorized for API access (e.g. submission paywall bypass, evaluation, protected routes that honor gold keys).
- **Invalid or missing key** → No gold-key authorization; normal auth/paywall rules apply (session, creator/operator, payment).

---

## Integration

- **Environment:** Valid keys are configured as a comma-separated list in `GOLDEN_FRACTAL_API_KEYS` (or `NSPFRNP_GOLD_KEYS`). No spaces around commas; keys are compared exactly.
- **Routes:** Any route that performs paywall or API authorization may call the gold-key validator and treat a valid key as authorized (e.g. exempt from payment, allow evaluation).
- **Metadata:** When a submission or action is authorized by gold key, record `payment_status: 'gold_key_exempt'` (or equivalent) in metadata for audit.

---

## Security

- Keys are server-side only; never expose the list or raw keys to the client.
- Use HTTPS in production so the key is not sent in the clear.
- Rotate keys via env config; no code change required.

---

**NSPFRNP ⊃ Golden Fractal Key: Accept new gold keys on API calls. One key, all realms, all API access when valid.**
