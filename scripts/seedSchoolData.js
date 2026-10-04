import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/db/index.js";
import { Enquiry } from "../src/models/enquiry.model.js";
import { NewsEvent } from "../src/models/newsEvent.model.js";

const images = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuACng_5vWjo2VirfQG4VPr_jdUKkkdTvuKeSGr-FIPNjoodV7VTgv894EM1mMk1_naLwAjtrM7uwag6VsLtKR2UTkWVt5UCttfBsVTHfCVrFtDi5NBt6TaUc5BHY5vKrFQVwme7FoAxMzeD7zI9us-HQBKrOxxpMctp8uu5QD4oeXC-q6nbtcCaWKeqnbuHKupj06JMusehJUWdrtkbu_2G6jKWakWyg0nQv1HCjrqfVba0cINY84TM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBtQ4A1-s8gFK3SIQyA6DA4Nffoiu9iP1jpQAWtUV-mC9zQO67REoGvBfULUWeOGEc7-qlUFPgsekjpaUT_YrB_eHyEW1miMayzJ5OEL2hjezV5rl18y6uQQlhmTyt0QAsJ4YBODLk69ZlXv2fmnrBP6VDGF3XKunXM6dhlSfHhQSSczIsl_mgs3sCLif6Cnq7AzD87Ujvk6iay9HoEhRhVcXuw1wiKM3ZzyVpnPOIYOwqwbH4_Yvbp",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDS00KhqxK7sxObSflMlsXoMAjhpGS1Wf-fmYOClP4Y5YSXCcg7bXMm17ZW9sC7HK1d0jIA1zVrN3uyG6ueqNgb52Pme3oSFO4-Bg5OEGBbZRnStGSm1C_Sz3rPa3QM9Hy9eo-y5raykQCxjJdZZEy7DPBZXby1i48M3Qjhy-G53em7syGB_WaYRs8gCEF19n6m9u0tm9uAAwrl27SejI8lypWCoASjggewxVo3btstostawNhFZjI0",
];

const newsEvents = [
  {
    title: "Annual Sports & Athletics Fiesta 2026",
    slug: "annual-sports-athletics-fiesta-2026",
    category: "Event",
    date: new Date("2026-10-20T09:00:00.000Z"),
    image: images[0],
    shortDescription: "A joyful day of movement, teamwork, and playful competition for our young learners.",
    content: "Our annual sports fiesta brings learners, families, and teachers together for a day of movement and encouragement. Children will explore age-appropriate races, team relays, and playful outdoor challenges. This sample story is seeded for admin preview.",
    published: true,
  },
  {
    title: "Stories Come Alive in Early Years",
    slug: "stories-come-alive-early-years",
    category: "News",
    date: new Date("2026-09-28T09:00:00.000Z"),
    image: images[1],
    shortDescription: "A week of shared stories helped our youngest learners build language and imagination.",
    content: "Classrooms became story circles as children listened, asked questions, and retold their favourite moments. Teachers used picture books, puppets, and creative play to support early language development. This sample story is seeded for admin preview.",
    published: true,
  },
  {
    title: "Young Innovators STEAM Showcase",
    slug: "young-innovators-steam-showcase",
    category: "Achievement",
    date: new Date("2026-09-24T09:00:00.000Z"),
    image: images[2],
    shortDescription: "Students shared curious questions, thoughtful prototypes, and creative solutions.",
    content: "The STEAM showcase celebrated learning through making. Students presented small prototypes, explained how they tested their ideas, and learned from one another. This sample story is seeded for admin preview.",
    published: true,
  },
  {
    title: "A Morning of Nature Discovery",
    slug: "morning-nature-discovery",
    category: "Event",
    date: new Date("2026-09-18T09:00:00.000Z"),
    image: images[0],
    shortDescription: "Children explored the campus garden through observation, sketching, and conversation.",
    content: "Learners looked closely at leaves, insects, and changing colours around the campus. The morning encouraged careful observation and respect for the natural world. This sample story is seeded for admin preview.",
    published: true,
  },
  {
    title: "Little Artists Celebrate Colour",
    slug: "little-artists-celebrate-colour",
    category: "Achievement",
    date: new Date("2026-09-12T09:00:00.000Z"),
    image: images[1],
    shortDescription: "Our young artists filled the gallery with bold colours and original ideas.",
    content: "The student gallery highlighted the many ways children express themselves through art. Families and classmates celebrated each piece and the stories behind it. This sample story is seeded for admin preview.",
    published: true,
  },
  {
    title: "Grandparents & Family Day: Honoring Our Roots",
    slug: "grandparents-family-day-honoring-our-roots",
    category: "Event",
    date: new Date("2026-10-02T09:00:00.000Z"),
    image: images[0],
    shortDescription: "Learners and families came together for a joyful celebration of stories, traditions, and intergenerational connection.",
    content: "The campus welcomed grandparents and families for a morning of shared stories, classroom games, music, and handmade notes of gratitude. Children and their loved ones celebrated the relationships that help every learner feel at home.",
    published: true,
  },
  {
    title: "Campus Notes: September Update",
    slug: "campus-notes-september-update",
    category: "News",
    date: new Date("2026-09-08T09:00:00.000Z"),
    image: images[2],
    shortDescription: "A short campus update for families, with this item kept unpublished as a draft example.",
    content: "This unpublished sample lets administrators preview how draft content appears in the admin panel before it is shared publicly.",
    published: false,
  },
];

const now = Date.now();
const enquiries = [
  {
    parentName: "Demo Parent One",
    studentName: "Demo Student One",
    classApplying: "Grade 1",
    mobile: "9000000001",
    email: "demo-parent-01@example.test",
    message: "[Seed data] Please share admission details for the upcoming term.",
    status: "New",
    crmStatus: "Pending",
    crmResponse: "Demo record; no CRM request was sent.",
    createdAt: new Date(now - 1 * 60 * 60 * 1000),
    updatedAt: new Date(now - 1 * 60 * 60 * 1000),
  },
  {
    parentName: "Demo Parent Two",
    studentName: "Demo Student Two",
    classApplying: "Nursery",
    mobile: "9000000002",
    email: "demo-parent-02@example.test",
    message: "[Seed data] We would like to arrange a campus visit.",
    status: "Contacted",
    crmStatus: "Pending",
    crmResponse: "Demo record; no CRM request was sent.",
    createdAt: new Date(now - 8 * 60 * 60 * 1000),
    updatedAt: new Date(now - 7 * 60 * 60 * 1000),
  },
  {
    parentName: "Demo Parent Three",
    studentName: "Demo Student Three",
    classApplying: "Kindergarten",
    mobile: "9000000003",
    email: "demo-parent-03@example.test",
    message: "[Seed data] Please send the fee structure and class schedule.",
    status: "Closed",
    crmStatus: "Pending",
    crmResponse: "Demo record; no CRM request was sent.",
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now - 24 * 60 * 60 * 1000),
  },
  {
    parentName: "Demo Parent Four",
    studentName: "Demo Student Four",
    classApplying: "Pre-Nursery",
    mobile: "9000000004",
    email: "demo-parent-04@example.test",
    message: "[Seed data] We are interested in the early years programme.",
    status: "New",
    crmStatus: "Pending",
    crmResponse: "Demo record; no CRM request was sent.",
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
  },
];

async function seedMissing(Model, records, keyField) {
  let inserted = 0;
  for (const record of records) {
    const key = record[keyField];
    const result = await Model.updateOne(
      { [keyField]: key },
      { $setOnInsert: record },
      { upsert: true, timestamps: false, runValidators: true },
    );
    inserted += result.upsertedCount;
  }
  return inserted;
}

try {
  await connectDB();
  const [newsInserted, enquiriesInserted] = await Promise.all([
    seedMissing(NewsEvent, newsEvents, "slug"),
    seedMissing(Enquiry, enquiries, "email"),
  ]);
  console.log(`Seeded ${newsInserted} news/events and ${enquiriesInserted} demo enquiries. Existing seed records were left unchanged.`);
} finally {
  await mongoose.disconnect();
}
