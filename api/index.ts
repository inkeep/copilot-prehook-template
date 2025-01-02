import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const Attribute = z
  .object({
    label: z.string().describe("A short identifier or name for the attribute (e.g. 'subscription_plan')."),

    value: z
      .string()
      .describe("The attribute's value, often a string that can be displayed or processed (e.g. 'premium')."),

    description: z
      .string()
      .nullish()
      .describe('An optional explanation or context about how to interpret or use this attribute.'),

    useWhen: z
      .string()
      .nullish()
      .describe(
        "An optional condition or scenario indicating when this attribute should be considered (e.g. 'when user asks about billing').",
      ),
  })
  .describe('A structured piece of contextual data (attribute) about the user or organization.');

const CopilotSmartAssistContextHookResponse = z
  .object({
    userAttributes: z
      .array(Attribute)
      .nullish()
      .describe('A list of user-specific attributes providing additional context about the end-user.'),

    organizationAttributes: z
      .array(Attribute)
      .nullish()
      .describe(
        "A list of organization-specific attributes providing additional context about the user's organization or account.",
      ),

    prompt: z
      .string()
      .nullish()
      .describe(
        "Optional custom instructions or guidance to influence the copilot's response (e.g. special handling instructions, tone guidelines).",
      ),
  })
  .describe(
    "The schema returned by the customer-owned endpoint, providing structured context and optional prompts to guide the copilot's responses.",
  );

type CopilotSmartAssistContextResponse = z.infer<typeof CopilotSmartAssistContextHookResponse>;

const MessageSchema = z.object({
  id: z.string(),
  createdAt: z.date().optional(),
  content: z.string(),
  authorId: z.string(),
  authorType: z.enum(['user', 'member']),
  authorName: z.string().optional(),
  files: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
    }),
  ),
  isInternalComment: z.boolean().optional(),
});

const CopilotSmartAssistContextRequestSchema = z.object({
  ticketId: z.string(),
  ticketAttributesData: z.record(
    z.string(),
    z.unknown().refine(val => !!val, { message: 'Value must be truthy' }),
  ),
  userAttributesData: z.record(
    z.string(),
    z.unknown().refine(val => !!val, { message: 'Value must be truthy' }),
  ),
  orgAttributesData: z.record(
    z.string(),
    z.unknown().refine(val => !!val, { message: 'Value must be truthy' }),
  ),
  messages: z.array(MessageSchema),
});

type CopilotSmartAssistContextRequest = z.infer<typeof CopilotSmartAssistContextRequestSchema>;


type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
  ) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  
    try {
      const parsedRequest = CopilotSmartAssistContextRequestSchema.safeParse(req.body);
  
      if (!parsedRequest.success) {
        return res.status(400).json({
          success: false,
          error: `Invalid request: ${parsedRequest.error.message}`,
        });
      }
  
      const { userAttributesData } = parsedRequest.data;
      const result = await fetchYourData(userAttributesData);
      return res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }


async function fetchYourData(userAttributesData: Record<string, unknown>): Promise<CopilotSmartAssistContextResponse> {
  // make 3rd party hook call to stripe, etc

  console.log('userAttributesData', userAttributesData);

  return {
    userAttributes: [],
    organizationAttributes: [],
    prompt: null,
  };
}
