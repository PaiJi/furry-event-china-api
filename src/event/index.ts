import xataInstance from "@/database/helper";
import imageURL from "@/utils/image";
import { Hono } from "hono";
const event = new Hono();
import Omit from "lodash/omit";

event.get("/recent", async (c) => {
  const xata = xataInstance(c);
  try {
    const result = await xata.db.event
      .filter({
        //过滤掉今天之前已经结束的，即目标展会的结束日期比今天大
        endDate: { $ge: new Date() },
      })
      .sort("startDate", "asc")
      .select([
        "name",
        "scale",
        "slug",
        "startDate",
        "endDate",
        "status",
        "coverUrl",
        "detail",
        "city",
        "address",
        "organization.name",
        "organization.slug",
        "organization.coverUrl",
      ])
      .getFirst();
    if (!result) throw new Error();

    const finalResult = {
      ...Omit(result, ["id", "xata", "organization.id", "organization.xata"]),
      ...(result.coverUrl ? { coverUrl: imageURL(result.coverUrl) } : {}),
      organization: {
        ...result.organization,
        ...(result.organization?.coverUrl
          ? { coverUrl: imageURL(result.organization?.coverUrl) }
          : {}),
        globalUrl: `https://www.furryeventchina.com/${result?.organization?.slug}/`,
        cnUrl: `https://www.furrycons.cn/${result?.organization?.slug}/`,
      },

      globalUrl: `https://www.furryeventchina.com/${result?.organization?.slug}/${result?.slug}`,
      cnUrl: `https://www.furrycons.cn/${result?.organization?.slug}/${result?.slug}`,
    };
    return c.json({
      total: 1,
      data: [finalResult],
    });
  } catch (error) {
    return c.json({ info: "No event available", total: 0, data: [] }, 404);
  }
});

export default event;
