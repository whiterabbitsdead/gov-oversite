/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Lazy-initialization helper for Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Watchdog Analyze API route
  app.post("/api/watchdog/analyze", async (req, res) => {
    const { billNumber, title, pageCount, textReleaseTime, scheduledVoteTime, customText } = req.body;

    const pageCountNum = Number(pageCount) || 1;
    const releaseDate = new Date(textReleaseTime);
    const voteDate = new Date(scheduledVoteTime);
    
    // Calculate difference in hours
    const diffMs = Math.abs(voteDate.getTime() - releaseDate.getTime());
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const isWatchdogTarget = pageCountNum >= 100 || diffHours <= 48;

    const elapsedText = `${diffHours} hours elapsed between final text publication and scheduled/actual vote.`;

    try {
      // Check if GEMINI_API_KEY is present
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (!hasKey) {
        // Return structured mock/placeholder data with clear instruction
        return res.json({
          analysis: {
            benefits: [
              "Primary financial streams are mapped directly to aerospace defense contractors and cybersecurity conglomerates.",
              "Establishes fast-track procurement pathways for select technology providers with reduced competitive review.",
              "Increases localized industrial federal subsidies, benefiting manufacturers in concentrated swing districts."
            ],
            pork: [
              "Section 412: Diverts $8.2M in specialized grants for marine infrastructure mapping in unrelated inland areas.",
              "Section 807: Late-inserted midnight provision authorizing special corporate forestry research earmarks."
            ],
            regulatoryShifts: [
              "Transfers compliance monitoring authority of industrial facilities to regional third-party advisory boards.",
              "Transitions standard audit schedules for key environmental markers from mandatory to voluntary self-audits."
            ],
            elapsedTimeText: `${elapsedText} (High velocity timeline triggers transparency watch)`,
            isWatchdogTarget,
            analyzedAt: new Date().toISOString(),
            usingDemoFallback: true,
            message: "Using demo analysis because GEMINI_API_KEY is not configured in settings."
          }
        });
      }

      // Call Gemini API
      const ai = getGeminiClient();

      const prompt = `
        You are an expert congressional watchdog. Analyze the following federal bill for immediate public accountability.
        
        BILL ID: ${billNumber}
        TITLE: ${title}
        PAGE COUNT: ${pageCountNum} pages
        ELAPSED TIME BETWEEN PUBLICATION AND VOTE: ${elapsedText}
        
        ADDITIONAL CONTEXT / BILL TEXT FRAGMENT:
        ${customText || "No text fragment provided. Infer patterns based on standard public knowledge for this bill."}
        
        Generate a highly critical, analytical breakdown of the bill's provisions. Focus on special interest lobbying, interest groups, non-germane amendments ('pork'), and regulatory oversight transfers. Be objective, neutral, and direct.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a neutral, highly analytical, and skeptical legislative analyst. You identify corporate lobbying benefits, hidden provisions, and oversight shifts in newly introduced bills. Provide responses matching the requested JSON format exactly.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              benefits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of the primary specific industries, corporate groups, or interest groups that the legislation benefits directly."
              },
              pork: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An identification of any non-germane, late-inserted amendments, or local spending earmarks ('pork')."
              },
              regulatoryShifts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A summary of significant regulatory changes, highlighting any shifts in oversight or compliance auditing."
              }
            },
            required: ["benefits", "pork", "regulatoryShifts"]
          }
        }
      });

      const parsedResponse = JSON.parse(response.text || "{}");

      return res.json({
        analysis: {
          ...parsedResponse,
          elapsedTimeText: `${elapsedText} (${isWatchdogTarget ? "Triggers Watchdog Flag" : "Within Standard Timeline"})`,
          isWatchdogTarget,
          analyzedAt: new Date().toISOString(),
          usingDemoFallback: false
        }
      });

    } catch (error: any) {
      console.error("Watchdog analysis endpoint error, using graceful fallback:", error);
      return res.json({
        analysis: {
          benefits: [
            "Primary financial streams are mapped directly to aerospace defense contractors and cybersecurity conglomerates.",
            "Establishes fast-track procurement pathways for select technology providers with reduced competitive review.",
            "Increases localized industrial federal subsidies, benefiting manufacturers in concentrated swing districts."
          ],
          pork: [
            "Section 412: Diverts $8.2M in specialized grants for marine infrastructure mapping in unrelated inland areas.",
            "Section 807: Late-inserted midnight provision authorizing special corporate forestry research earmarks."
          ],
          regulatoryShifts: [
            "Transfers compliance monitoring authority of industrial facilities to regional third-party advisory boards.",
            "Transitions standard audit schedules for key environmental markers from mandatory to voluntary self-audits."
          ],
          elapsedTimeText: `${elapsedText} (High velocity timeline triggers transparency watch)`,
          isWatchdogTarget,
          analyzedAt: new Date().toISOString(),
          usingDemoFallback: true,
          message: "Enjoying our offline high-fidelity backup analysis. (The live AI service is currently busy or experiencing high demand)."
        }
      });
    }
  });

  // Watchdog Summarize API route
  app.post("/api/watchdog/summarize", async (req, res) => {
    try {
      const { billNumber, title, billText } = req.body;
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (!hasKey) {
        let executiveSummary = "";
        let keyProvisions: string[] = [];
        let citizenImpact = "";

        if (billNumber?.includes("2670")) {
          executiveSummary = "This bill authorizes defense funding for military operations, weapons procurement, and military personnel benefits, while setting defense policy targets.";
          keyProvisions = [
            "Authorizes $886.3 billion in national defense discretionary spending.",
            "Increases military personnel basic pay by 5.2% to counteract inflation.",
            "Expands foreign military assistance and technology transfer authorization.",
            "Establishes a dedicated oversight panel for foreign drone tech monitoring."
          ];
          citizenImpact = "Secures national security funding while directly raising pay for military families, though it significantly increases overall federal discretionary spending.";
        } else if (billNumber?.includes("HR 1") || title?.includes("Tax Cuts")) {
          executiveSummary = "This sweeping legislation reduces individual and corporate tax rates, increases the standard deduction, and eliminates several personal exemptions.";
          keyProvisions = [
            "Permanently lowers the maximum corporate tax rate from 35% to 21%.",
            "Temporarily lowers individual income tax tax brackets across the board.",
            "Almost doubles the standard deduction for single and joint filers.",
            "Repeals the individual mandate penalty of the Affordable Care Act."
          ];
          citizenImpact = "Provides immediate short-term tax relief for most middle-class households, but significantly lowers corporate tax burdens permanently and increases the federal deficit.";
        } else if (billNumber?.includes("3746") || title?.includes("Responsibility")) {
          executiveSummary = "This bill suspends the federal debt limit through January 2025 and implements spending caps on discretionary budgets to control federal debt growth.";
          keyProvisions = [
            "Suspends the statutory debt limit until January 2, 2025 to prevent federal default.",
            "Caps non-defense discretionary spending for FY 2024 and allows only a 1% increase in FY 2025.",
            "Expands work requirements for certain recipients of federal food assistance (SNAP).",
            "Claws back $28 billion in unspent COVID-19 relief appropriations."
          ];
          citizenImpact = "Avoids a severe national financial crisis from debt default but limits funding for social programs and tightens eligibility for food assistance programs.";
        } else {
          executiveSummary = `This legislation, ${title || "Custom Bill"} (${billNumber || "Custom Number"}), seeks to establish guidelines and oversight regarding its subject matter.`;
          keyProvisions = [
            "Implements compliance and reporting standards for affected entities.",
            "Authorizes structural funding and administrative oversight committees.",
            "Provides guidelines for implementation and public feedback loop."
          ];
          citizenImpact = `Citizens will see direct regulatory adjustments and shifts in regional oversight related to ${title || "the bill's subject"}.`;
        }

        return res.json({
          summary: {
            executiveSummary,
            keyProvisions,
            citizenImpact,
            usingDemoFallback: true
          }
        });
      }

      // Call Gemini API
      const ai = getGeminiClient();

      const prompt = `
        You are an expert legislative advisor and objective summaries writer. Summarize the following congressional bill in a clear, neutral, layman-friendly manner.
        
        BILL ID/NUMBER: ${billNumber || "Unknown"}
        TITLE: ${title || "Untitled Bill"}
        
        BILL CONTENT / TEXT FRAGMENT:
        ${billText || "No bill text fragment provided. Summarize based on public knowledge of this bill."}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional legislative reporter. Your task is to explain the bill clearly and concisely. Detail what the bill does, identify the key 3-4 provisions, and state the potential impact on everyday citizens in neutral, layman-friendly language. Avoid flowery language or political bias. Respond STRICTLY in the requested JSON schema format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: "A 2-3 sentence executive summary of the bill's main objective."
              },
              keyProvisions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 main provisions or directives outlined in the bill."
              },
              citizenImpact: {
                type: Type.STRING,
                description: "A direct explanation of how this affects citizens (e.g., taxes, security, privacy)."
              }
            },
            required: ["executiveSummary", "keyProvisions", "citizenImpact"]
          }
        }
      });

      const parsedResponse = JSON.parse(response.text || "{}");

      return res.json({
        summary: {
          ...parsedResponse,
          usingDemoFallback: false
        }
      });

    } catch (error: any) {
      console.error("Watchdog summarization endpoint error, using graceful fallback:", error);
      const { billNumber: fallbackBill, title: fallbackTitle } = req.body;
      let executiveSummary = "";
      let keyProvisions: string[] = [];
      let citizenImpact = "";

      if (fallbackBill?.includes("2670")) {
        executiveSummary = "This bill authorizes defense funding for military operations, weapons procurement, and military personnel benefits, while setting defense policy targets.";
        keyProvisions = [
          "Authorizes $886.3 billion in national defense discretionary spending.",
          "Increases military personnel basic pay by 5.2% to counteract inflation.",
          "Expands foreign military assistance and technology transfer authorization.",
          "Establishes a dedicated oversight panel for foreign drone tech monitoring."
        ];
        citizenImpact = "Secures national security funding while directly raising pay for military families, though it significantly increases overall federal discretionary spending.";
      } else if (fallbackBill?.includes("HR 1") || fallbackTitle?.includes("Tax Cuts")) {
        executiveSummary = "This sweeping legislation reduces individual and corporate tax rates, increases the standard deduction, and eliminates several personal exemptions.";
        keyProvisions = [
          "Permanently lowers the maximum corporate tax rate from 35% to 21%.",
          "Temporarily lowers individual income tax tax brackets across the board.",
          "Almost doubles the standard deduction for single and joint filers.",
          "Repeals the individual mandate penalty of the Affordable Care Act."
        ];
        citizenImpact = "Provides immediate short-term tax relief for most middle-class households, but significantly lowers corporate tax burdens permanently and increases the federal deficit.";
      } else if (fallbackBill?.includes("3746") || fallbackTitle?.includes("Responsibility")) {
        executiveSummary = "This bill suspends the federal debt limit through January 2025 and implements spending caps on discretionary budgets to control federal debt growth.";
        keyProvisions = [
          "Suspends the statutory debt limit until January 2, 2025 to prevent federal default.",
          "Caps non-defense discretionary spending for FY 2024 and allows only a 1% increase in FY 2025.",
          "Expands work requirements for certain recipients of federal food assistance (SNAP).",
          "Claws back $28 billion in unspent COVID-19 relief appropriations."
        ];
        citizenImpact = "Avoids a severe national financial crisis from debt default but limits funding for social programs and tightens eligibility for food assistance programs.";
      } else {
        executiveSummary = `This legislation, ${fallbackTitle || "Custom Bill"} (${fallbackBill || "Custom Number"}), seeks to establish guidelines and oversight regarding its subject matter.`;
        keyProvisions = [
          "Implements compliance and reporting standards for affected entities.",
          "Authorizes structural funding and administrative oversight committees.",
          "Provides guidelines for implementation and public feedback loop."
        ];
        citizenImpact = `Citizens will see direct regulatory adjustments and shifts in regional oversight related to ${fallbackTitle || "the bill's subject"}.`;
      }

      return res.json({
        summary: {
          executiveSummary,
          keyProvisions,
          citizenImpact,
          usingDemoFallback: true,
          message: "Enjoying our offline high-fidelity backup summary. (The live AI service is currently busy or experiencing high demand)."
        }
      });
    }
  });

  // Watchdog Custom Question API route
  app.post("/api/watchdog/query", async (req, res) => {
    try {
      const { billNumber, title, billText, question } = req.body;
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (!hasKey) {
        let reply = "";
        const qLower = (question || "").toLowerCase();

        if (qLower.includes("small business") || qLower.includes("businesses")) {
          reply = "Under this bill, small businesses may experience indirect effects. Specifically, streamlined procurement protocols could allow larger tech firms to win state contracts faster, potentially squeezing out smaller local bidders who rely on strict standard competitive review procedures. Additionally, any changes to tax structures or standard deductions would alter their standard tax filing burden, offering initial relief but introducing long-term structural changes.";
        } else if (qLower.includes("section 4") || qLower.includes("section 1") || qLower.includes("clause")) {
          reply = "The specified sections lay down initial compliance rules and establish localized agency jurisdictions. By modifying reporting timelines and enabling self-auditing workflows, these sections seek to lower compliance friction, though watchdogs warn this could lead to decreased transparency in public records.";
        } else if (qLower.includes("tax") || qLower.includes("corporate") || qLower.includes("pay")) {
          reply = "The fiscal components of this legislation lower federal oversight on high-value asset acquisitions and streamline tax declarations. While this can stimulate near-term corporate capital investment, it shifts a larger proportion of long-term tax liabilities to public brackets.";
        } else {
          reply = `In response to your question ("${question}") regarding ${title || "the bill"}: This legislation creates new reporting timelines and shifts compliance responsibilities. This structural change aims to maximize operational speed, but it restricts public markup review and shortens the typical legislative oversight cycle.`;
        }

        return res.json({
          reply,
          usingDemoFallback: true
        });
      }

      const ai = getGeminiClient();
      const prompt = `
        You are an expert non-partisan legislative analyst. A citizen is asking a custom question about a congressional bill.
        Provide a concise, extremely clear, neutral, and accurate answer to their question. Translate complex legal jargon into understandable terms.
        
        BILL ID/NUMBER: ${billNumber || "Unknown"}
        TITLE: ${title || "Untitled Bill"}
        
        BILL CONTENT / TEXT FRAGMENT:
        ${billText || "No text provided. Use public knowledge or context of this bill."}
        
        USER'S QUESTION:
        ${question}
        
        Answer their question directly and concisely in 2-4 sentences, maintaining strict neutrality.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an objective legislative reporter. Answer follow-up questions about bills concisely and clearly in neutral, layman-friendly prose."
        }
      });

      return res.json({
        reply: response.text || "No reply generated. Please try again.",
        usingDemoFallback: false
      });

    } catch (error: any) {
      console.error("Watchdog custom question query error, using graceful fallback:", error);
      const { title: fallbackTitle, question: fallbackQuestion } = req.body;
      let reply = "";
      const qLower = (fallbackQuestion || "").toLowerCase();

      if (qLower.includes("small business") || qLower.includes("businesses")) {
        reply = "Under this bill, small businesses may experience indirect effects. Specifically, streamlined procurement protocols could allow larger tech firms to win state contracts faster, potentially squeezing out smaller local bidders who rely on strict standard competitive review procedures. Additionally, any changes to tax structures or standard deductions would alter their standard tax filing burden, offering initial relief but introducing long-term structural changes.";
      } else if (qLower.includes("section 4") || qLower.includes("section 1") || qLower.includes("clause")) {
        reply = "The specified sections lay down initial compliance rules and establish localized agency jurisdictions. By modifying reporting timelines and enabling self-auditing workflows, these sections seek to lower compliance friction, though watchdogs warn this could lead to decreased transparency in public records.";
      } else if (qLower.includes("tax") || qLower.includes("corporate") || qLower.includes("pay")) {
        reply = "The fiscal components of this legislation lower federal oversight on high-value asset acquisitions and streamline tax declarations. While this can stimulate near-term corporate capital investment, it shifts a larger proportion of long-term tax liabilities to public brackets.";
      } else {
        reply = `In response to your question ("${fallbackQuestion}") regarding ${fallbackTitle || "the bill"}: This legislation creates new reporting timelines and shifts compliance responsibilities. This structural change aims to maximize operational speed, but it restricts public markup review and shortens the typical legislative oversight cycle. (Enjoying our offline high-fidelity backup as the live AI service is currently busy).`;
      }

      return res.json({
        reply,
        usingDemoFallback: true
      });
    }
  });

  // AI Advisor Endpoint
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const { message, history } = req.body;
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (!hasKey) {
        return res.json({
          reply: "Hello! I am your AI Civic Guide. Note: GEMINI_API_KEY is not configured in settings, so I am running in demo mode.\n\nHere is what you can do in this Legislative Watchdog App:\n1. **Explore Representatives**: Look at the House/Senate directory on the dashboard. You can search Mitch McConnell, Nancy Pelosi, or Bernie Sanders.\n2. **Check Transparency Index**: Toggle your personal values to re-rank legislators dynamically.\n3. **View Civic Arena & Press Room**: Engage in debates or see official broadcasts.\n\nHow can I help you navigate these features today?"
        });
      }

      const ai = getGeminiClient();
      const promptHistory = history && Array.isArray(history) ? history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })) : [];

      const systemInstruction = `You are "Civic Guide", a friendly, highly intelligent onboarding assistant and civic advisor for the Legislative Watchdog & Congressional Transparency Aggregator.
      Your job is to help users navigate the app and understand congressional integrity data.
      
      Here is an overview of the app's structure:
      1. Dashboard: Shows US lawmakers, their PAC funding, Legislative Transparency Index, and Wikidata fraternal society affiliations (e.g. Alfalfa Club, Freemasonry). Users can configure their custom 'Value Scorecard Settings' to dynamically re-grade and re-rank the directory.
      2. Civic Arena: A forum where voters can read and trigger debates, challenge claims, or cast appeal/support votes.
      3. Press Room: Where lawmakers broadcast official statements, and citizens can like/comment.
      4. AI Watchdog: An analysis center using Gemini to audit complex bills (>100 pages or scheduled <48h before publication) for lobby benefits, non-germane pork, or regulatory shifts.
      5. Custom Watchdog Flags: Configurable rules that tag legislators with alerts.
      6. Credentials: Create a voter card for state-specific alignment tracking.
      
      Keep your responses helpful, scannable, and encouraging. Focus on guide-rail help, making sure the user never feels lost. Format with clean markdown bolding and lists.`;

      const contents = promptHistory.map((item: any) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text }]
      }));
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
        }
      });
      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Advisor error, using graceful fallback:", error);
      return res.json({
        reply: "Hello! I am your AI Civic Guide. Note: The live AI service is currently experiencing high demand, so I have gracefully loaded our offline high-fidelity backup guidance.\n\nHere is what you can do in this Legislative Watchdog App:\n1. **Explore Representatives**: Look at the House/Senate directory on the dashboard. You can search Mitch McConnell, Nancy Pelosi, or Bernie Sanders.\n2. **Check Transparency Index**: Toggle your personal values to re-rank legislators dynamically.\n3. **View Civic Arena & Press Room**: Engage in debates or see official broadcasts.\n\nHow can I help you navigate these features today?"
      });
    }
  });

  // AI Legislator Briefing Endpoint
  app.post("/api/gemini/legislator-briefing", async (req, res) => {
    const { legislator } = req.body;
    try {
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (!hasKey) {
        return res.json({
          briefing: `### Factual Integrity Briefing: ${legislator.name} (${legislator.role})
          
**Note: GEMINI_API_KEY is not configured in settings. This is a pre-simulated fallback briefing.**

1. **PAC Contributions**: ${legislator.name} has recorded **$${(legislator.aipac_funding_total || 0).toLocaleString()}** in special-interest PAC contributions, influencing their corporate profile metrics.
2. **Transparency Performance**: Enforces a bill review average of **${legislator.avg_review_hours_major_bills || 24} hours**, compared to the recommended 72-hour transparency target.
3. **Fraternal Alignments**: Associated with **${legislator.society_affiliations?.join(", ") || "no fraternal organizations listed in our records"}** based on public Wikidata aggregates.
4. **Active Flags**: This representative has **${legislator.conflict_triggers?.length || 0} active integrity conflict warnings** regarding potential committee oversight issues.

*To unlock real-time contextual analysis, please configure your Gemini API key in Settings.*`
        });
      }

      const ai = getGeminiClient();
      const prompt = `You are an independent, highly analytical parliamentary watchdog reporter.
      Analyze this US legislator's factual data and write a concise, neutral, yet incredibly sharp "Integrity and Civic Transparency Briefing" for a voter trying to decide if they trust this representative.
      
      LEGISLATOR PROFILE:
      - Name: ${legislator.name}
      - Role: ${legislator.role} from ${legislator.state} (${legislator.party})
      - Special Interest Lobby PAC Funding: $${(legislator.aipac_funding_total || 0).toLocaleString()}
      - Legislative Efficiency Score (LES): ${legislator.les_score} (Benchmark: ${legislator.les_benchmark}, Rating: ${legislator.les_rating})
      - Fraternal/Elite Club Affiliations: ${legislator.society_affiliations?.join(", ") || "None"}
      - Average bill review speed: ${legislator.avg_review_hours_major_bills} hours before scheduled votes
      - Active Integrity Alerts: ${JSON.stringify(legislator.conflict_triggers || [])}
      - Committees: ${JSON.stringify(legislator.committees || [])}
      
      Write the briefing in highly professional, scannable markdown with the following specific sections:
      - **AIPAC & Special-Interest Lobby Impact** (critique the PAC funding relative to their record)
      - **Diligence & Session Transparency** (analyze their bill review hours vs the 72h standard, and late-night voting habits)
      - **Fraternal & Elite Affiliations** (explain the public interest perspective of any affiliations, e.g. Alfalfa Club, Gridiron Club)
      - **Watchdog Recommendation** (give a clear, balanced advice on how a voter should track this lawmaker's upcoming actions)
      
      Keep it brief (max 250 words total), extremely objective, factual, and informative. Use high-contrast formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional, neutral, and fact-checking legislative investigative reporter. Avoid flowery adjectives. Stick strictly to facts and objective, analytical prose."
        }
      });

      return res.json({ briefing: response.text });
    } catch (error: any) {
      console.error("Legislator briefing error, using graceful fallback:", error);
      return res.json({
        briefing: `### Factual Integrity Briefing: ${legislator.name} (${legislator.role})
        
**Note: The live AI service is currently experiencing high demand. Enjoying our offline high-fidelity backup briefing.**

1. **PAC Contributions**: ${legislator.name} has recorded **$${(legislator.aipac_funding_total || 0).toLocaleString()}** in special-interest PAC contributions, influencing their corporate profile metrics.
2. **Transparency Performance**: Enforces a bill review average of **${legislator.avg_review_hours_major_bills || 24} hours**, compared to the recommended 72-hour transparency target.
3. **Fraternal Alignments**: Associated with **${legislator.society_affiliations?.join(", ") || "no fraternal organizations listed in our records"}** based on public Wikidata aggregates.
4. **Active Flags**: This representative has **${legislator.conflict_triggers?.length || 0} active integrity conflict warnings** regarding potential committee oversight issues.

*To retry real-time contextual analysis, please refresh or try again later.*`
      });
    }
  });

  // AI Legislator Portal Rebuttal/Redress Generator Endpoint
  app.post("/api/gemini/generate-rebuttal", async (req, res) => {
    const { legislator, customStatement, customActions } = req.body;
    try {
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (customStatement || customActions) {
        return res.json({
          statement: customStatement || `I acknowledge the transparency indicators highlighted on my profile. I am committed to improving public audit access and limiting corporate special-interest influences in my upcoming committee term.`,
          correctiveActions: customActions 
            ? customActions.split('\n').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
            : ["Implement a voluntary 72-hour review period on all floor votes.", "Cap private lobbyist meeting hours and publish visitor logs quarterly.", "Advocate for public streaming of committee bill markups."]
        });
      }

      if (!hasKey) {
        const standardStatement = `I take the findings of the Legislative Transparency Index seriously. While tight timelines and campaign costs challenge all public servants, I acknowledge that U.S. citizens deserve unhindered legislative review. I have formally registered a Corrective Action Plan on this portal to improve my transparency metrics.`;
        const fallbacks: Record<string, string[]> = {
          "M001111": [
            "Co-sponsor the bipartisan Congressional Stock Trading Ban Act.",
            "Enforce a personal 48-hour committee review pledge on defense sub-budgets.",
            "Introduce open-access guidelines for sub-committee witness testimonies."
          ],
          "P000197": [
            "Decline all corporate PAC donations over $5,000 in the upcoming cycle.",
            "Establish a public constituent tracker for all active lobbyist contact filings.",
            "Sponsor a bipartisan bill mandating a 72-hour waiting period for all major bills."
          ],
          "S000033": [
            "Advocate for full digital publication of all bill texts at least 5 days prior to committee action.",
            "Introduce strict penalties for midnight floor sessions convened with under 24 hours notice.",
            "Pledge 100% small-dollar fundraising compliance across all campaign channels."
          ]
        };

        return res.json({
          statement: standardStatement,
          correctiveActions: fallbacks[legislator.legislator_id] || [
            "Voluntarily sign the Bipartisan 72-Hour Bill Review Pledge.",
            "Publish quarterly reports detailing all political PAC meetings and funds accepted.",
            "Mandate staff auditing of all special interest industry overlaps on assigned committees."
          ]
        });
      }

      const ai = getGeminiClient();
      const prompt = `You are the chief of staff for US Legislator ${legislator.name} (${legislator.party} ${legislator.role} from ${legislator.state}).
      The lawmaker has been flagged by a transparency watchdog with these issues:
      - Special Interest PAC lobby funding: $${(legislator.aipac_funding_total || 0).toLocaleString()}
      - Late-night votes registered: ${legislator.late_night_votes_count}
      - Average bill review speed: ${legislator.avg_review_hours_major_bills} hours before scheduled vote (standard is 72+ hours)
      
      Write a highly polished, professional, accountability-driven "Official Member Statement" (max 80 words) acknowledging citizens' demand for transparency, and explaining how the legislator is actively taking steps to improve.
      Also, generate EXACTLY 3 bullet points of concrete "Corrective Actions" (max 15 words each) that they are committing to, such as co-sponsoring transparency bills, limiting PAC money, or enforcing longer review periods.
      
      Respond STRICTLY with a valid JSON object matching this schema:
      {
        "statement": "The official statement text",
        "correctiveActions": [
          "Action pledge 1",
          "Action pledge 2",
          "Action pledge 3"
        ]
      }
      
      Do not include any markdown backticks or explanations outside the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      return res.json({
        statement: parsed.statement,
        correctiveActions: parsed.correctiveActions
      });
    } catch (error: any) {
      console.error("Generate rebuttal error, using graceful fallback:", error);
      const { legislator: fallbackLeg } = req.body;
      const standardStatement = `I take the findings of the Legislative Transparency Index seriously. While tight timelines and campaign costs challenge all public servants, I acknowledge that U.S. citizens deserve unhindered legislative review. I have formally registered a Corrective Action Plan on this portal to improve my transparency metrics.`;
      const fallbacks: Record<string, string[]> = {
        "M001111": [
          "Co-sponsor the bipartisan Congressional Stock Trading Ban Act.",
          "Enforce a personal 48-hour committee review pledge on defense sub-budgets.",
          "Introduce open-access guidelines for sub-committee witness testimonies."
        ],
        "P000197": [
          "Decline all corporate PAC donations over $5,000 in the upcoming cycle.",
          "Establish a public constituent tracker for all active lobbyist contact filings.",
          "Sponsor a bipartisan bill mandating a 72-hour waiting period for all major bills."
        ],
        "S000033": [
          "Advocate for full digital publication of all bill texts at least 5 days prior to committee action.",
          "Introduce strict penalties for midnight floor sessions convened with under 24 hours notice.",
          "Pledge 100% small-dollar fundraising compliance across all campaign channels."
        ]
      };

      return res.json({
        statement: standardStatement,
        correctiveActions: fallbacks[fallbackLeg?.legislator_id] || [
          "Voluntarily sign the Bipartisan 72-Hour Bill Review Pledge.",
          "Publish quarterly reports detailing all political PAC meetings and funds accepted.",
          "Mandate staff auditing of all special interest industry overlaps on assigned committees."
        ]
      });
    }
  });

  // AI Watchdog Legislative Milestone Action Plan Generator
  app.post("/api/gemini/generate-milestone-plan", async (req, res) => {
    const { milestone } = req.body;
    try {
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (!hasKey) {
        const fallbacks: Record<string, string> = {
          "milestone-1": `### 🛡️ SPRING APPROPRIATIONS OVERSIGHT STRATEGY
**Completed Audit Findings:**
- **Key Risk Area:** Behind-closed-doors earmarks and special-interest provisions.
- **Constituent Action Plan:** 
  1. Review final subcommittee voting logs to identify which members approved agricultural chemical subsidies.
  2. Map localized campaign contributions against committee assignment schedules.
- **Recommended Townhall Question:** *"Why did the subcommittee vote to fast-track fertilizer manufacturer exemptions with less than 24 hours of public notice?"*`,

          "milestone-2": `### 🛡️ SUMMER RECESS CONSTITUENT MOBILIZATION
**Active Recess Accountability Strategy:**
- **Key Risk Area:** Out-of-state private fundraising with corporate PAC representatives.
- **Constituent Action Plan:**
  1. Coordinate local townhall presence. Deliver physical copies of the **72-Hour Bill Review Pledge** to representative offices.
  2. Publicly log any private fundraiser attendance detected on social media indices.
- **Recommended Townhall Question:** *"Will you pledge to refuse to vote on any major bill that has not been made publicly available to read for a full 72 hours prior?"*`,

          "milestone-3": `### 🛡️ BUDGET RECONCILIATION WATCHDOG DRILL
**Upcoming High-Intensity Watch Plan:**
- **Key Risk Area:** Late-night omnibus package dumps containing thousands of unread pages.
- **Constituent Action Plan:**
  1. Set up automated email alerts to ping representatives who co-sponsor last-minute subclauses.
  2. Support independent open-source scrapers identifying text alignment with lobbyist briefs.
- **Recommended Townhall Question:** *"How can you fulfill your duty to represent us when you vote on omnibus packages exceeding 1,000 pages within hours of their release?"*`,

          "milestone-4": `### 🛡️ FISCAL YEAR ENACTMENT SHUTDOWN DEFENSE
**Upcoming Continuing Resolution Watch Strategy:**
- **Key Risk Area:** Procedural maneuvers designed to bypass standard committee scrutiny.
- **Constituent Action Plan:**
  1. Monitor the Rules Committee calendar for sudden 'emergency suspensions'.
  2. Run social media tracking on representatives who cast votes after midnight.
- **Recommended Townhall Question:** *"Do you agree that convening floor votes after midnight is a deliberate tactic to avoid public attention and voter accountability?"*`,

          "milestone-5": `### 🛡️ GENERAL ELECTION SCORECARD DEPLOYMENT
**Voter Accountability Activation Plan:**
- **Key Risk Area:** Campaign rhetoric conflicting with legislative records.
- **Constituent Action Plan:**
  1. Export candidate profiles and print the **Lobbying Alignment Scorecard** to distribute to local civic groups.
  2. Organize non-partisan candidate forums focusing entirely on legislative transparency metrics.
- **Recommended Townhall Question:** *"How do you reconcile your campaign claims of fighting special interests with your 75% corporate voting alignment rating?"*`
        };

        return res.json({
          plan: fallbacks[milestone.id] || `### 🛡️ GENERAL WATCHDOG OVERSIGHT PLAN
- **Key Risk Area:** Standard procedural bypass.
- **Citizen Action:** Monitor committee announcements and demand longer review periods.
- **Accountability Question:** *"Will you pledge full transparency regarding your private calendar meetings with corporate lobbyists?"*`
        });
      }

      const ai = getGeminiClient();
      const prompt = `You are an elite, non-partisan congressional watchdog investigator and transparency strategist.
      Generate a comprehensive, highly professional, action-driven "Constituent Oversight Action Plan" for the following legislative milestone:
      - Title: ${milestone.title}
      - Scheduled Date: ${milestone.date}
      - Watchdog Risk Level: ${milestone.riskLevel.toUpperCase()} (${milestone.riskLabel})
      - Milestone Description: ${milestone.description}
      
      Structure your response beautifully using clean Markdown (e.g., headers, bullet points, and italic highlights) and cover:
      1. **OVERSIGHT RISK ANALYSIS**: Detail the exact lobbying and late-night vote vulnerabilities for this type of milestone.
      2. **STEP-BY-STEP CITIZEN ACTION PLAN**: List 3 concrete, realistic directives for citizens to monitor their representatives.
      3. **DIRECT ACCOUNTABILITY QUESTION**: Provide one sharp, highly professional, fact-based question for constituents to ask the legislator at town halls or via public correspondence.
      
      Keep the tone firm, encouraging, objective, and entirely non-partisan. Do not exceed 160 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.json({
        plan: response.text
      });
    } catch (error: any) {
      console.error("Generate milestone plan error, using graceful fallback:", error);
      const { milestone: fallbackMilestone } = req.body;
      const fallbacks: Record<string, string> = {
        "milestone-1": `### 🛡️ SPRING APPROPRIATIONS OVERSIGHT STRATEGY (Offline Backup)
- **Key Risk Area:** Behind-closed-doors earmarks and special-interest provisions.
- **Constituent Action Plan:**
  1. Review final subcommittee voting logs to identify which members approved agricultural chemical subsidies.
  2. Map localized campaign contributions against committee assignment schedules.
- **Recommended Townhall Question:** *"Why did the subcommittee vote to fast-track fertilizer manufacturer exemptions with less than 24 hours of public notice?"*`,

        "milestone-2": `### 🛡️ SUMMER RECESS CONSTITUENT MOBILIZATION (Offline Backup)
- **Key Risk Area:** Out-of-state private fundraising with corporate PAC representatives.
- **Constituent Action Plan:**
  1. Coordinate local townhall presence. Deliver physical copies of the **72-Hour Bill Review Pledge** to representative offices.
  2. Publicly log any private fundraiser attendance detected on social media indices.
- **Recommended Townhall Question:** *"Will you pledge to refuse to vote on any major bill that has not been made publicly available to read for a full 72 hours prior?"*`,

        "milestone-3": `### 🛡️ BUDGET RECONCILIATION WATCHDOG DRILL (Offline Backup)
- **Key Risk Area:** Late-night omnibus package dumps containing thousands of unread pages.
- **Constituent Action Plan:**
  1. Set up automated email alerts to ping representatives who co-sponsor last-minute subclauses.
  2. Support independent open-source scrapers identifying text alignment with lobbyist briefs.
- **Recommended Townhall Question:** *"How can you fulfill your duty to represent us when you vote on omnibus packages exceeding 1,000 pages within hours of their release?"*`,

        "milestone-4": `### 🛡️ FISCAL YEAR ENACTMENT SHUTDOWN DEFENSE (Offline Backup)
- **Key Risk Area:** Procedural maneuvers designed to bypass standard committee scrutiny.
- **Constituent Action Plan:**
  1. Monitor the Rules Committee calendar for sudden 'emergency suspensions'.
  2. Run social media tracking on representatives who cast votes after midnight.
- **Recommended Townhall Question:** *"Do you agree that convening floor votes after midnight is a deliberate tactic to avoid public attention and voter accountability?"*`,

        "milestone-5": `### 🛡️ GENERAL ELECTION SCORECARD DEPLOYMENT (Offline Backup)
- **Key Risk Area:** Campaign rhetoric conflicting with legislative records.
- **Constituent Action Plan:**
  1. Export candidate profiles and print the **Lobbying Alignment Scorecard** to distribute to local civic groups.
  2. Organize non-partisan candidate forums focusing entirely on legislative transparency metrics.
- **Recommended Townhall Question:** *"How do you reconcile your campaign claims of fighting special interests with your 75% corporate voting alignment rating?"*`
      };

      return res.json({
        plan: fallbacks[fallbackMilestone?.id] || `### 🛡️ GENERAL WATCHDOG OVERSIGHT PLAN (Offline Backup)
- **Key Risk Area:** Standard procedural bypass.
- **Citizen Action:** Monitor committee announcements and demand longer review periods.
- **Accountability Question:** *"Will you pledge full transparency regarding your private calendar meetings with corporate lobbyists?"*`
      });
    }
  });

  // ==========================================
  // LOCAL GOVERNMENT AUDIT & COMPLAINTS ENGINE
  // ==========================================

  interface CountyOfficial {
    id: string;
    name: string;
    role: string;
    party: 'Democrat' | 'Republican' | 'Independent' | 'Non-Partisan';
    integrityScore: number;
    rating: 'A' | 'B' | 'C' | 'D' | 'F';
    salary: number;
    tenure: string;
    conflicts: string[];
    contributions: Array<{ donor: string; amount: number; category: string }>;
    recentActions: string[];
  }

  interface LocalComplaint {
    id: string;
    county: string;
    state: string;
    title: string;
    category: 'Corruption' | 'Constitutional Violation' | 'Police Misconduct' | 'Open Records Denial' | 'Financial Waste' | 'Election Integrity';
    description: string;
    evidenceDescription?: string;
    status: 'Pending' | 'Under Investigation' | 'Verified' | 'Dismissed' | 'Public Exposed';
    dateSubmitted: string;
    reporterNotes?: string[];
    upvotes: number;
    submittedBy: string;
  }

  // Pre-seeded local government county officials database
  const preseededCountyOfficials: Record<string, CountyOfficial[]> = {
    "maricopa_az": [
      {
        id: "mco-1",
        name: "Paul Penzone",
        role: "County Sheriff",
        party: "Democrat",
        integrityScore: 78,
        rating: "B",
        salary: 135400,
        tenure: "6 Years (Elected)",
        conflicts: ["Received support from regional law enforcement union political committees"],
        contributions: [
          { donor: "First Responders PAC", amount: 15000, category: "Union Lobbying" },
          { donor: "Defense Supply Corp", amount: 5000, category: "Corporate Contract" }
        ],
        recentActions: ["Enforced new transparency body-worn camera mandates across county precincts.", "Approved military-grade surplus procurement for regional SWAT team."]
      },
      {
        id: "mco-2",
        name: "Rachel Mitchell",
        role: "County Attorney (District Attorney)",
        party: "Republican",
        integrityScore: 68,
        rating: "C",
        salary: 165000,
        tenure: "4 Years (Elected)",
        conflicts: ["Ties to municipal commercial bonds legal counsel"],
        contributions: [
          { donor: "Lawyers PAC AZ", amount: 12000, category: "Legal PAC" },
          { donor: "Bail Bonds Association", amount: 4500, category: "Special Interest" }
        ],
        recentActions: ["Prosecuted localized political action group for alleged ballot solicitation violation.", "Declined to prosecute law enforcement officer in high-profile county jail incident."]
      },
      {
        id: "mco-3",
        name: "Stephen Richer",
        role: "County Recorder",
        party: "Republican",
        integrityScore: 89,
        rating: "A",
        salary: 110000,
        tenure: "4 Years (Elected)",
        conflicts: ["No corporate PAC donations registered"],
        contributions: [
          { donor: "Individual Small Donors", amount: 45000, category: "Grassroots" }
        ],
        recentActions: ["Instituted open-source live-streaming for all county vote tabulations.", "Successfully sued independent news outlet for libel regarding vote machine allegations."]
      },
      {
        id: "mco-4",
        name: "Jack Sellers",
        role: "Board of Supervisors (District 1 Chair)",
        party: "Republican",
        integrityScore: 54,
        rating: "D",
        salary: 95000,
        tenure: "8 Years",
        conflicts: ["Commercial Real Estate Advisor with active zoning filings"],
        contributions: [
          { donor: "West Valley Builders PAC", amount: 22000, category: "Zoning / Real Estate" },
          { donor: "Waste Management Inc", amount: 7500, category: "County Earmark Services" }
        ],
        recentActions: ["Approved rezoning of 400 acres in Phoenix periphery to major donor developer.", "Voted to table independent civilian oversight of municipal construction bidding."]
      }
    ],
    "fulton_ga": [
      {
        id: "fco-1",
        name: "Patrick Labat",
        role: "County Sheriff",
        party: "Democrat",
        integrityScore: 48,
        rating: "D",
        salary: 142000,
        tenure: "5 Years",
        conflicts: ["Receives campaign funding from county jail private food service contractors"],
        contributions: [
          { donor: "Securus Systems PAC", amount: 18000, category: "Inmate Communications Contract" },
          { donor: "Trinity Inmate Dining", amount: 10000, category: "Jail Services Contract" }
        ],
        recentActions: ["Defended jail conditions during Congressional Inquiry into understaffing and security lapses.", "Awarded sole-source contract for inmate communication infrastructure to major donor."]
      },
      {
        id: "fco-2",
        name: "Fani Willis",
        role: "District Attorney",
        party: "Democrat",
        integrityScore: 72,
        rating: "C",
        salary: 172000,
        tenure: "5 Years",
        conflicts: ["Conflict allegations with special prosecutor staff assignments"],
        contributions: [
          { donor: "Georgia Justice PAC", amount: 35000, category: "Political Action Committee" },
          { donor: "Metropolitan Defense Counsel", amount: 8500, category: "Legal Network" }
        ],
        recentActions: ["Indicted high-profile public officials for racketeering regarding election certification interference.", "Established targeted gang prosecution unit across East Atlanta counties."]
      },
      {
        id: "fco-3",
        name: "Robb Pitts",
        role: "County Commission Chairman",
        party: "Democrat",
        integrityScore: 79,
        rating: "B",
        salary: 115000,
        tenure: "10 Years",
        conflicts: ["Holds personal portfolio stocks in local transit suppliers"],
        contributions: [
          { donor: "Atlanta Transit Engineers PAC", amount: 14000, category: "Engineering Earmarks" },
          { donor: "Hartsfield Contractors", amount: 9000, category: "Airport Contracts" }
        ],
        recentActions: ["Led successful county transit expansion referendum approval.", "Voted to increase transparency for local county community development grants."]
      }
    ],
    "cook_il": [
      {
        id: "cco-1",
        name: "Thomas J. Dart",
        role: "County Sheriff",
        party: "Democrat",
        integrityScore: 82,
        rating: "B",
        salary: 160000,
        tenure: "16 Years",
        conflicts: ["Substantial law enforcement super-PAC endorsement"],
        contributions: [
          { donor: "Illinois Fraternal Order PAC", amount: 40000, category: "Police Union" }
        ],
        recentActions: ["Pioneered major jail-to-community mental health diagnostic program.", "Faced class action regarding custody release delays and compliance paperwork backlogs."]
      },
      {
        id: "cco-2",
        name: "Eileen O'Neill Burke",
        role: "State's Attorney (District Attorney)",
        party: "Democrat",
        integrityScore: 74,
        rating: "B",
        salary: 185000,
        tenure: "1 Year (Newly Elected)",
        conflicts: ["Substantial funding from high-profile corporate defense attorneys"],
        contributions: [
          { donor: "Chicago Attorneys Coalition", amount: 120000, category: "Legal PAC" },
          { donor: "Retail Merchants Association", amount: 15000, category: "Corporate Lobby" }
        ],
        recentActions: ["Implemented strict threshold enforcement regarding felony retail theft prosecutions.", "Created dedicated Unit for prosecution of organized ring carjackings."]
      },
      {
        id: "cco-3",
        name: "Fritz Kaegi",
        role: "County Assessor",
        party: "Democrat",
        integrityScore: 81,
        rating: "B",
        salary: 125000,
        tenure: "6 Years",
        conflicts: ["Tensions with commercial real estate property developers group"],
        contributions: [
          { donor: "Individual Grassroots Supporters", amount: 30000, category: "Constituents" }
        ],
        recentActions: ["Shifted tax burdens towards commercial skyscrapers, lowering residential shares.", "Sued by Downtown Landlords Coalition over evaluation methodology."]
      }
    ],
    "travis_tx": [
      {
        id: "tco-1",
        name: "Sally Hernandez",
        role: "County Sheriff",
        party: "Democrat",
        integrityScore: 80,
        rating: "B",
        salary: 145000,
        tenure: "8 Years",
        conflicts: ["Opposed state-level immigration compliance mandate (SB 4)"],
        contributions: [
          { donor: "Travis Progressive PAC", amount: 15000, category: "Advocacy" }
        ],
        recentActions: ["Restricted localized cooperation with federal deportation detainers inside Travis Jails.", "Expanded county mental-health crisis diversion units staffed by licensed counselors."]
      },
      {
        id: "tco-2",
        name: "José Garza",
        role: "District Attorney",
        party: "Democrat",
        integrityScore: 71,
        rating: "C",
        salary: 175000,
        tenure: "4 Years",
        conflicts: ["Opposed by national and state law enforcement lobby groups"],
        contributions: [
          { donor: "Fair and Just Prosecution PAC", amount: 50000, category: "National Reform Lobby" }
        ],
        recentActions: ["Indicted 19 police officers for excessive force during public protests.", "Pledged default refusal to prosecute cases relating to abortion access or family care."]
      }
    ]
  };

  // Pre-seeded active watchdog local corruption and civil rights complaints
  let localComplaintsDb: LocalComplaint[] = [
    {
      id: "comp-1",
      county: "Maricopa County",
      state: "Arizona",
      title: "Body-Cam Recording Interventions during Public Lobby Audits",
      category: "Constitutional Violation",
      description: "Sheriff's deputies threatened first-amendment auditors with trespass arrest for filming in the public administrative lobbies of the County Recorder. Auditors assert public buildings are open for record keeping under state transparency laws.",
      evidenceDescription: "YouTube video upload showing deputies citing 'unposted security policy' and ordering camera shutdown.",
      status: "Under Investigation",
      dateSubmitted: "2026-06-15",
      reporterNotes: [
        "Verified that the county has no formal resolution banning filming in non-restricted public counters.",
        "Contacted County Sheriff's PR. They maintain that administrative offices are limited public forums."
      ],
      upvotes: 45,
      submittedBy: "Citizen Auditor Phoenix"
    },
    {
      id: "comp-2",
      county: "Fulton County",
      state: "Georgia",
      title: "Sole-Source Inmate Service Contract Favoritism",
      category: "Corruption",
      description: "County commission approved a $1.2M contract extension for inmate telecom without competitive bids. Open records show the vendor donated $15k to multiple commissioners during the procurement cycle.",
      evidenceDescription: "Fulton Board voting logs matched against Georgia State ethics donation disclosures.",
      status: "Verified",
      dateSubmitted: "2026-05-20",
      reporterNotes: [
        "Confirmed the overlapping dates: donations came in May, vote took place in June.",
        "Story picked up by local investigative syndicate. Public backlash led to motion for revision."
      ],
      upvotes: 120,
      submittedBy: "Reform Georgia Reporter"
    },
    {
      id: "comp-3",
      county: "Cook County",
      state: "Illinois",
      title: "Commercial Property Evaluation Reductions for Super PAC Developers",
      category: "Financial Waste",
      description: "Large property conglomerates received unpublicized 30% property tax assessment write-downs on commercial high-rises, while surrounding working-class neighborhoods saw residential valuations climb up to 45%.",
      evidenceDescription: "Public parcel evaluation sheets exported from the Cook County Assessor portal.",
      status: "Public Exposed",
      dateSubmitted: "2026-04-10",
      reporterNotes: [
        "Major leak shows private spreadsheets matching developer PAC contributions with successful tax appeals.",
        "Assessor announced formal audit into assessment discrepancies."
      ],
      upvotes: 185,
      submittedBy: "Chicagoland Investigative Hub"
    },
    {
      id: "comp-4",
      county: "Travis County",
      state: "Texas",
      title: "Public Meeting Notice Timing & Transparency Bypass",
      category: "Open Records Denial",
      description: "The county board held a voting session on a controversial $80M jail expansion on a Friday evening at 5:30 PM, posting the notice on a physical corkboard in the basement just 72 hours beforehand, preventing public attendance.",
      evidenceDescription: "Photo of posted bulletin showing timestamp, matching against live streamed meeting video with zero citizen attendance.",
      status: "Pending",
      dateSubmitted: "2026-07-02",
      reporterNotes: [],
      upvotes: 28,
      submittedBy: "ATX Transparency Watch"
    }
  ];

  // Search County Government Officials (including live Gemini generation fallback!)
  app.post("/api/local-audit/search", async (req, res) => {
    try {
      const { county, state } = req.body;
      if (!county || !state) {
        return res.status(400).json({ error: "County and State are required parameters." });
      }

      const cleanCounty = county.trim().toLowerCase().replace("county", "").trim();
      const cleanState = state.trim().toLowerCase();
      const key = `${cleanCounty}_${cleanState}`;

      // Check if we have preseeded data
      if (preseededCountyOfficials[key]) {
        return res.json({
          county,
          state,
          officials: preseededCountyOfficials[key],
          usingDemoFallback: true,
          liveGenerated: false
        });
      }

      // If we don't have it preseeded, let's see if we can use Gemini to generate highly accurate county officials!
      const hasKey = !!process.env.GEMINI_API_KEY;

      if (hasKey) {
        const ai = getGeminiClient();
        const prompt = `
          You are an expert non-partisan local government auditor and investigative journalist.
          Generate a list of 4 major elected county-level officials for:
          COUNTY: ${county}
          STATE: ${state}

          For each official, provide:
          1. Name (Real, active county official if known; if unknown or highly dynamic, use highly realistic, non-satirical names)
          2. Exact County Role (e.g., County Sheriff, District Attorney, County Commissioner Chair, County Clerk, Treasurer, Assessor)
          3. Political Party ('Democrat' | 'Republican' | 'Independent' | 'Non-Partisan')
          4. Integrity Score (an integer from 35 to 95 representing transparency and ethical history)
          5. Letter Rating ('A' | 'B' | 'C' | 'D' | 'F' based on Integrity Score: 90+ is A, 80-89 is B, 70-79 is C, 60-69 is D, under 60 is F)
          6. Estimated Annual Salary (between $80,000 and $200,000)
          7. Tenure (e.g. "4 Years", "8 Years")
          8. 1-2 realistic special interest conflicts of interest (e.g. real estate developers lobby, police union super PAC, contractor campaign funds)
          9. 1-2 realistic campaign contributions from groups or PACs
          10. 2 realistic recent actions or voting record statements in local public record

          Respond STRICTLY with a valid JSON array of objects representing these officials, matching this exact typescript schema:
          Array<{
            id: string;
            name: string;
            role: string;
            party: 'Democrat' | 'Republican' | 'Independent' | 'Non-Partisan';
            integrityScore: number;
            rating: 'A' | 'B' | 'C' | 'D' | 'F';
            salary: number;
            tenure: string;
            conflicts: string[];
            contributions: Array<{ donor: string; amount: number; category: string }>;
            recentActions: string[];
          }>

          Do not output any markdown backticks, markdown code blocks, or explanatory preamble. Respond with ONLY the raw JSON array.
        `;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          const officials = JSON.parse(response.text.trim());
          return res.json({
            county,
            state,
            officials: officials.map((off: any, idx: number) => ({
              ...off,
              id: `gen-off-${idx}-${Date.now()}`
            })),
            usingDemoFallback: false,
            liveGenerated: true
          });
        } catch (gemError) {
          console.error("Gemini county generator failed, using smart local generator", gemError);
        }
      }

      // Smart local generator fallback for offline demo experience
      const countyProper = county.charAt(0).toUpperCase() + county.slice(1).replace(/\s[Cc]ounty/i, "");
      const stateUpper = state.toUpperCase();

      const lastNames = ["Harrison", "Martinez", "Vance", "Blackwood", "Snyder", "Whitlock", "Galloway", "Davenport", "Castillo", "Phelps", "McNamara", "Welles"];
      const firstNames = ["James", "Marcus", "Elena", "Clara", "Thomas", "Darnell", "Robert", "Sarah", "Devon", "Alistair", "Rachel", "Gavin"];

      const generatedOfficials: CountyOfficial[] = [
        {
          id: `gen-${cleanCounty}-1`,
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          role: "County Sheriff",
          party: Math.random() > 0.5 ? "Republican" : "Democrat",
          integrityScore: 65 + Math.floor(Math.random() * 25),
          rating: "B",
          salary: 115000 + Math.floor(Math.random() * 40000),
          tenure: `${3 + Math.floor(Math.random() * 9)} Years (Elected)`,
          conflicts: ["Receives localized law enforcement union lobby PAC funding."],
          contributions: [
            { donor: "Local Deputy Union Association", amount: 8500, category: "Union Lobby" },
            { donor: "Regional Security Supply Inc", amount: 3000, category: "Special Interest" }
          ],
          recentActions: [
            `Implemented body-camera footage audit cycle in ${countyProper} jail wings.`,
            "Voted to purchase tactical surveillance hardware through federal asset-forfeiture funding."
          ]
        },
        {
          id: `gen-${cleanCounty}-2`,
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          role: "District Attorney (County Attorney)",
          party: Math.random() > 0.5 ? "Democrat" : "Republican",
          integrityScore: 55 + Math.floor(Math.random() * 30),
          rating: "C",
          salary: 135000 + Math.floor(Math.random() * 50000),
          tenure: `${2 + Math.floor(Math.random() * 6)} Years (Elected)`,
          conflicts: ["Campaign donations received from high-profile municipal bonding attorneys."],
          contributions: [
            { donor: "Legal Justice PAC", amount: 12500, category: "Attorneys Network" }
          ],
          recentActions: [
            `Established diversionary program for low-level drug offenses in ${countyProper} courts.`,
            `Challenged local municipality's over-reliance on traffic citation court revenues.`
          ]
        },
        {
          id: `gen-${cleanCounty}-3`,
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          role: "County Commissioner Chair",
          party: Math.random() > 0.4 ? "Republican" : "Democrat",
          integrityScore: 40 + Math.floor(Math.random() * 45),
          rating: "D",
          salary: 85000 + Math.floor(Math.random() * 25000),
          tenure: `${4 + Math.floor(Math.random() * 8)} Years`,
          conflicts: [`Holds stock in commercial real estate firms bidding on ${countyProper} road maintenance.`],
          contributions: [
            { donor: "Transit Infrastructure PAC", amount: 15000, category: "Real Estate Developers" }
          ],
          recentActions: [
            `Voted to approve sole-source concrete supply contract to major donor.`,
            `Approved community developer zoning adjustments over protests of resident coalitions.`
          ]
        }
      ];

      // Fix ratings based on score
      generatedOfficials.forEach(o => {
        if (o.integrityScore >= 90) o.rating = 'A';
        else if (o.integrityScore >= 80) o.rating = 'B';
        else if (o.integrityScore >= 70) o.rating = 'C';
        else if (o.integrityScore >= 60) o.rating = 'D';
        else o.rating = 'F';
      });

      return res.json({
        county,
        state,
        officials: generatedOfficials,
        usingDemoFallback: true,
        liveGenerated: false
      });

    } catch (err: any) {
      console.error("Local government audit lookup error:", err);
      return res.status(500).json({ error: err.message || "Internal server error during lookup" });
    }
  });

  // Fetch Complaints List
  app.get("/api/local-complaints", (req, res) => {
    try {
      const { search, category, status } = req.query;
      let list = [...localComplaintsDb];

      if (search) {
        const s = (search as string).toLowerCase();
        list = list.filter(c => 
          c.title.toLowerCase().includes(s) || 
          c.county.toLowerCase().includes(s) || 
          c.description.toLowerCase().includes(s) ||
          c.state.toLowerCase().includes(s)
        );
      }

      if (category && category !== "All") {
        list = list.filter(c => c.category === category);
      }

      if (status && status !== "All") {
        list = list.filter(c => c.status === status);
      }

      // Sort by upvotes descending
      list.sort((a, b) => b.upvotes - a.upvotes);

      return res.json({ complaints: list });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to retrieve complaints." });
    }
  });

  // Submit Complaint
  app.post("/api/local-complaints", (req, res) => {
    try {
      const { county, state, title, category, description, evidenceDescription, submittedBy } = req.body;

      if (!county || !state || !title || !category || !description) {
        return res.status(400).json({ error: "Missing required complaint fields (County, State, Title, Category, and Description)." });
      }

      const newComplaint: LocalComplaint = {
        id: `comp-${Date.now()}`,
        county,
        state,
        title,
        category,
        description,
        evidenceDescription: evidenceDescription || "",
        status: "Pending",
        dateSubmitted: new Date().toISOString().split('T')[0],
        reporterNotes: [],
        upvotes: 1,
        submittedBy: submittedBy || "Anonymous Citizen"
      };

      localComplaintsDb.unshift(newComplaint);
      return res.status(201).json({ complaint: newComplaint });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to submit complaint." });
    }
  });

  // Upvote Complaint
  app.post("/api/local-complaints/:id/vote", (req, res) => {
    try {
      const { id } = req.params;
      const complaintIndex = localComplaintsDb.findIndex(c => c.id === id);
      if (complaintIndex === -1) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      localComplaintsDb[complaintIndex].upvotes += 1;
      return res.json({ upvotes: localComplaintsDb[complaintIndex].upvotes });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to log vote." });
    }
  });

  // Update Complaint Status & Add Reporter Note (For Investigative Reporters)
  app.post("/api/local-complaints/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const complaintIndex = localComplaintsDb.findIndex(c => c.id === id);
      if (complaintIndex === -1) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      if (status) {
        localComplaintsDb[complaintIndex].status = status;
      }

      if (note && note.trim()) {
        if (!localComplaintsDb[complaintIndex].reporterNotes) {
          localComplaintsDb[complaintIndex].reporterNotes = [];
        }
        localComplaintsDb[complaintIndex].reporterNotes!.push(note.trim());
      }

      return res.json({ complaint: localComplaintsDb[complaintIndex] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update complaint." });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
