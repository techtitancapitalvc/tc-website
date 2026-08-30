import { defineField, defineType } from "sanity";

/**
 * /titanecosystem — page hero. Singleton.
 *
 * Heading, an overlapping stack of founder avatars with a count beside it,
 * and a description. The avatar stack is decorative: it is there to show that
 * the community has faces, not to identify anyone, so the images carry no
 * captions and the count is written by hand rather than derived from the
 * number of photos — an editor can show six faces and still say "500+".
 */
export const titanEcosystemHero = defineType({
  name: "titanEcosystemHero",
  title: "Titan Ecosystem — Hero",
  type: "document",

  fields: [
    defineField({
      name: "headingLineOne",
      title: "Heading — first line",
      description: 'e.g. "More Than Capital,"',
      type: "string",
    }),
    defineField({
      name: "headingLineTwo",
      title: "Heading — second line",
      description:
        'e.g. "A Community". Kept as its own field rather than a line break so the two lines can never collapse onto one at an awkward width.',
      type: "string",
    }),

    defineField({
      name: "founderCountLabel",
      title: "Founder count",
      description: 'The text beside the avatars, e.g. "500+ founders".',
      type: "string",
    }),
    defineField({
      name: "founderAvatars",
      title: "Founder avatars",
      description:
        "The overlapping circles beside the count. Decorative — five or six reads best; more just makes the stack wide. Square crops work best, since each is masked to a circle.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
      validation: (r) => r.max(8),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
  ],

  preview: { prepare: () => ({ title: "Titan Ecosystem — Hero" }) },
});
