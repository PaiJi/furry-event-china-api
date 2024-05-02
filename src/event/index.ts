import { Hono } from "hono";
import Omit from "lodash/omit";
import xataInstance from "@/database/helper";
import imageURL from "@/utils/image";

const event = new Hono();

event.get("/recent", async (c) => {
  const xata = xataInstance(c);
  const keepOld = c.req.query("keep_old") === "true";

  try {
    let events = await xata.db.event
      .filter({
        //过滤掉今天之前已经结束的，即目标展会的结束日期比今天大
        endDate: {
          $ge: new Date(),
          $le: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
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
      .getMany();
    if (events.length === 0 && keepOld) {
      const lastestEvent = await xata.db.event
        .filter({
          //找出比今天旧的展会
          endDate: {
            $le: new Date(),
          },
        })
        .sort("startDate", "desc")
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
      lastestEvent && events.push(lastestEvent);
    }

    const enhancedEvents = events.map((event) => ({
      ...Omit(event, ["id", "xata", "organization.id", "organization.xata"]),
      ...(event.coverUrl ? { coverUrl: imageURL(event.coverUrl) } : {}),
      organization: {
        ...Omit(event.organization, ["id", "xata"]),
        ...(event.organization?.coverUrl
          ? { coverUrl: imageURL(event.organization?.coverUrl) }
          : {}),
        globalUrl: `https://www.furryeventchina.com/${event?.organization?.slug}/`,
        cnUrl: `https://www.furrycons.cn/${event?.organization?.slug}/`,
      },

      globalUrl: `https://www.furryeventchina.com/${event?.organization?.slug}/${event?.slug}`,
      cnUrl: `https://www.furrycons.cn/${event?.organization?.slug}/${event?.slug}`,
    }));

    return c.json({
      total: events.length,
      data: enhancedEvents,
    });
  } catch (error) {
    return c.json({ info: "No event available", total: 0, data: [] }, 204);
  }
});

export default event;
