import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
	CopilotSmartAssistContextRequestSchema,
	type CopilotSmartAssistContextResponse,
	type MessageType,
} from "../inkeepSupportCopilotSchemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({
			success: false,
			error: "Method not allowed",
		});
	}

	try {
		const parsedRequest = CopilotSmartAssistContextRequestSchema.safeParse(
			req.body,
		);

		if (!parsedRequest.success) {
			console.log(
				parsedRequest.error.errors.map((err) => err.message).join(", "),
			);
			return res.status(400).json({
				success: false,
				error: `Invalid request: ${parsedRequest.error.errors.map((err) => err.message).join(", ")}`,
			});
		}

		const {
			ticketId,
			ticketingPlatformType,
			ticketAttributesData,
			userAttributesData,
			orgAttributesData,
			messages,
		} = parsedRequest.data;
		const result = await fetchYourData({
			ticketId,
			ticketingPlatformType,
			ticketAttributesData,
			userAttributesData,
			orgAttributesData,
			messages,
		});
		return res.json({ success: true, data: result });
	} catch (error) {
		console.error("Error processing request:", error);
		return res
			.status(500)
			.json({ success: false, error: "Internal server error" });
	}
}

async function fetchYourData({
	ticketId,
	ticketingPlatformType,
	ticketAttributesData,
	userAttributesData,
	orgAttributesData,
	messages,
}: {
	ticketId: string;
	ticketingPlatformType: string;
	ticketAttributesData: Record<string, unknown>;
	userAttributesData: Record<string, unknown>;
	orgAttributesData: Record<string, unknown>;
	messages: MessageType[];
}): Promise<CopilotSmartAssistContextResponse> {
	// TODO: Write your business logic here

	// TODO: Add any custom instructions or guidance to influence the copilot's response. This is an example.
	const prompt = `
	These are the user attributes and organization attributes.
	If the user or organization is a subscriber to the Enterprise plan, it is important to note that in the response to the support agent.
	`;

	return {
		userAttributes: [],
		organizationAttributes: [],
		prompt,
	};
}
