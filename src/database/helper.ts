import { XataClient } from "@/database/xata";
import { Context } from "hono";
import { env } from "hono/adapter";

const xataInstance = (c: Context<any, any, {}>) => {
  const { XATA_API_KEY, XATA_BRANCH } = env<{
    XATA_API_KEY: string;
    XATA_BRANCH: string;
  }>(c);
  return new XataClient({ apiKey: XATA_API_KEY, branch: XATA_BRANCH });
};

export default xataInstance;
