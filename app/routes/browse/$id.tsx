import {
  faFacebook,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEllipsis, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Mentor } from "@prisma/client";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Button from "~/components/Buttons/IconButton";
import { getFacebookHref } from "~/utils/facebook";
import { getLinkedInHref } from "~/utils/linkedIn";
import { getSocialMetas } from "~/utils/seo";
import { getTwitterHref } from "~/utils/twitter";
import { getDisplayUrl } from "~/utils/url";
import MenuButton from "~/components/Buttons/MenuButton";
import CTAButton from "~/components/Buttons/CTAButton";
import Tag from "~/components/Tag";
import { H2, Paragraph } from "~/components/Typography";
import Avatar from "~/components/Avatar";

type LoaderData = { data: { mentor: Mentor; shareUrl: string } };

export const meta: MetaFunction = ({ data, parentsData }) => {
  const { requestInfo } = parentsData.root;
  return getSocialMetas({
    url: getDisplayUrl(requestInfo),
    title: `${data.data.mentor.name}`,
    description: `${data.data.mentor.bio}`,
    ogTitle: `Get mentored by ${data.data.mentor.name} on Hoots!`,
    image: data.data.mentor.img,
  });
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const baseUrl = new URL(request.url).origin;
  const shareUrl = request.url;
  const mentor = await fetch(
    `${baseUrl}/.netlify/functions/get-mentor?id=${params.id}`
  )
    .then((mentors) => mentors.json())
    .catch(() => {
      console.error("Failed to get mentor, please try again in a few minutes.");
    });

  return json({ data: { mentor: mentor as Mentor, shareUrl } });
};

export function MentorPage() {
  const { data } = useLoaderData<LoaderData>();
  const { mentor } = data;
  const { shareUrl } = data;
  const title = "I'm mentoring on Hoots 🦉 Can't wait to meet with you!";
  return (
    <div className="justify-center" key={mentor?.id}>
      <div className="flex justify-between mb-5">
        <Button
          leftIcon={
            <ArrowLeftIcon
              className="-ml-0.5 mr-2 h-4 w-4"
              aria-hidden="true"
            />
          }
          onClick={() => {
            window.history.back();
          }}
        >
          Back
        </Button>
        <MenuButton
          options={[
            {
              title: "Share on Twitter",
              href: getTwitterHref({
                url: shareUrl,
                title,
              }),
              icon: <FontAwesomeIcon icon={faTwitter} />,
            },
            {
              title: "Share on LinkedIn",
              href: getLinkedInHref({
                url: shareUrl,
              }),
              icon: <FontAwesomeIcon icon={faLinkedin} />,
            },
            {
              title: "Share on Facebook",
              href: getFacebookHref({
                url: shareUrl,
              }),
              icon: <FontAwesomeIcon icon={faFacebook} />,
            },
          ]}
          label="Share Mentor Profile"
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </MenuButton>
      </div>
      <div className="flex justify-center max-w-xl mx-auto">
        <div className="flex flex-col">
          <div className="flex justify-center pb-5">
            <Avatar
              src={mentor?.img ?? undefined}
              alt={`${mentor?.name} profile picture`}
              size="lg"
            />
          </div>
          <H2 className="font-bold">{mentor?.name}</H2>
          <Paragraph>💼 {mentor?.occupation}</Paragraph>
          <Paragraph>🏢 {mentor?.company}</Paragraph>
          <Paragraph>🕒 {mentor?.experience} years</Paragraph>
          <Paragraph>💲 {mentor?.cost || "FREE"}</Paragraph>
          <div className="py-1 flex flex-wrap">
            {mentor?.tags.map((tag: any) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <Paragraph>{mentor?.bio}</Paragraph>
          <CTAButton
            icon={
              <FontAwesomeIcon
                icon={faPaperPlane}
                style={{ marginLeft: "0.5em" }}
              />
            }
            href="apply"
          >
            Apply
          </CTAButton>
        </div>
      </div>
    </div>
  );
}

export default MentorPage;
