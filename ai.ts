import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const aiRouter = router({
  // Generate AI response for chat
  generateResponse: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        context: z.string().optional(),
        language: z.enum(["ar", "en"]).default("en"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant in a social chat application. Respond in ${input.language === "ar" ? "Arabic" : "English"}.`,
            },
            {
              role: "user",
              content: input.message,
            },
          ],
          maxTokens: 500,
        });

        const response = result.choices[0]?.message?.content || "";
        return {
          response: typeof response === "string" ? response : JSON.stringify(response),
          success: true,
        };
      } catch (error) {
        console.error("AI generation error:", error);
        throw new Error("Failed to generate AI response");
      }
    }),

  // Analyze sentiment of message
  analyzeSentiment: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Analyze the sentiment of this text and respond with only one word: positive, negative, or neutral.\n\nText: "${input.text}"`,
            },
          ],
          maxTokens: 10,
        });

        const sentiment = (result.choices[0]?.message?.content || "neutral")
          .toString()
          .toLowerCase()
          .trim();
        return {
          sentiment: sentiment as "positive" | "negative" | "neutral",
          success: true,
        };
      } catch (error) {
        console.error("Sentiment analysis error:", error);
        throw new Error("Failed to analyze sentiment");
      }
    }),

  // Generate smart reply suggestions
  getSmartReplies: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Generate 3 short, casual reply suggestions for this message. Return only the 3 replies separated by newlines, no numbering.\n\nMessage: "${input.message}"`,
            },
          ],
          maxTokens: 200,
        });

        const content = result.choices[0]?.message?.content || "";
        const replies = (typeof content === "string" ? content : JSON.stringify(content))
          .split("\n")
          .filter((r) => r.trim())
          .slice(0, 3);

        return {
          replies,
          success: true,
        };
      } catch (error) {
        console.error("Smart replies error:", error);
        throw new Error("Failed to generate smart replies");
      }
    }),

  // Translate message
  translateMessage: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        targetLanguage: z.enum(["ar", "en"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Translate this text to ${input.targetLanguage === "ar" ? "Arabic" : "English"}. Return only the translation.\n\nText: "${input.text}"`,
            },
          ],
          maxTokens: 500,
        });

        const translation = (result.choices[0]?.message?.content || "").toString().trim();
        return {
          translation,
          success: true,
        };
      } catch (error) {
        console.error("Translation error:", error);
        throw new Error("Failed to translate message");
      }
    }),

  // Generate message summary
  summarizeMessage: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Summarize this text in one sentence:\n\n"${input.text}"`,
            },
          ],
          maxTokens: 100,
        });

        const summary = (result.choices[0]?.message?.content || "").toString().trim();
        return {
          summary,
          success: true,
        };
      } catch (error) {
        console.error("Summarization error:", error);
        throw new Error("Failed to summarize message");
      }
    }),

  // Check for spam/inappropriate content
  checkContent: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Check if this text contains spam, hate speech, or inappropriate content. Respond with only: safe, warning, or blocked.\n\nText: "${input.text}"`,
            },
          ],
          maxTokens: 10,
        });

        const status = (result.choices[0]?.message?.content || "safe")
          .toString()
          .toLowerCase()
          .trim();
        return {
          status: status as "safe" | "warning" | "blocked",
          success: true,
        };
      } catch (error) {
        console.error("Content check error:", error);
        throw new Error("Failed to check content");
      }
    }),

  // Generate message tags/hashtags
  generateTags: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Generate 3-5 relevant hashtags for this message. Return only hashtags separated by spaces.\n\nMessage: "${input.text}"`,
            },
          ],
          maxTokens: 100,
        });

        const content = result.choices[0]?.message?.content || "";
        const tags = (typeof content === "string" ? content : JSON.stringify(content))
          .split(" ")
          .filter((tag: string) => tag.startsWith("#"))
          .slice(0, 5);

        return {
          tags,
          success: true,
        };
      } catch (error) {
        console.error("Tag generation error:", error);
        throw new Error("Failed to generate tags");
      }
    }),

  // Extract entities (names, places, etc.)
  extractEntities: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Extract named entities (names, places, organizations) from this text. Return as JSON array.\n\nText: "${input.text}"`,
            },
          ],
          maxTokens: 200,
        });

        try {
          const content = result.choices[0]?.message?.content || "[]";
          const entities = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
          return {
            entities,
            success: true,
          };
        } catch {
          return {
            entities: [],
            success: true,
          };
        }
      } catch (error) {
        console.error("Entity extraction error:", error);
        throw new Error("Failed to extract entities");
      }
    }),
});
