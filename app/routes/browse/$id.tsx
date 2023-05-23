import {
  faFacebook,
  faGithub,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEllipsis, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Mentor } from "@prisma/client";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { getFacebookHref } from "~/utils/facebook";
import { getLinkedInHref } from "~/utils/linkedIn";
import { getSocialMetas } from "~/utils/seo";
import { getTwitterHref } from "~/utils/twitter";
import { getDisplayUrl } from "~/utils/url";
import MenuButton from "~/components/Buttons/MenuButton";
import CTAButton from "~/components/Buttons/CTAButton";
import Tag from "~/components/Tag";
import { H2, H4, H6, Paragraph } from "~/components/Typography";
import Avatar from "~/components/Avatar";
import { routes } from "~/routes";
import IconLink from "~/components/Buttons/IconLink";

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
        <IconLink
          leftIcon={
            <ArrowLeftIcon
              className="-ml-0.5 mr-2 h-4 w-4"
              aria-hidden="true"
            />
          }
          to={routes.browse}
        >
          Back
        </IconLink>
      </div>
      <div className="flex justify-start max-w-5xl mx-auto">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row pb-10">
            <div>
              <Avatar
                src={mentor?.img ?? undefined}
                alt={`${mentor?.name} profile picture`}
                size="lg"
                border
              />
            </div>
            <div className="md:ml-5">
              <H2 className="font-bold">{mentor?.name}</H2>
              <Paragraph>{mentor?.occupation}</Paragraph>
              <div className="flex">
                <Paragraph>
                  {mentor.cost ? "$" : ""}
                  {mentor.cost || "FREE"}
                </Paragraph>
                <span className="ml-1 text-lg font-medium text-gray-500 dark:text-gray-400">
                  {mentor.cost ? "/ month" : null}
                </span>
              </div>
            </div>

            <div className="mt-2 md:mt-0 md:ml-auto flex space-x-5">
              <span>
                <MenuButton
                  direction="left"
                  className="h-10"
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
              </span>
              <span>
                <CTAButton
                  variant="primarySmall"
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
              </span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="shadow-md dark:bg-zinc-800 bg-gray-100 col-span-12 lg:col-span-6 h-full w-full rounded-md p-5">
              <H4 className="mb-1">About Me</H4>
              <Paragraph>{mentor?.bio}</Paragraph>
            </div>
            <div className="shadow-md dark:bg-zinc-800 bg-gray-100 col-span-12 lg:col-span-6 h-full w-full rounded-md p-5">
              <div className="grid gap-2">
                <div>
                  <H6 className="mb-1">Skills</H6>
                  <div className="gap-y-2 flex flex-wrap">
                    {mentor?.tags.map((tag: any) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <H6 className="mb-1">Experience</H6>
                  <Paragraph>🕒 {mentor?.experience} years</Paragraph>
                  <Paragraph>💼 {mentor?.industry}</Paragraph>
                  <Paragraph>🏢 {mentor?.company}</Paragraph>
                </div>
                {mentor.website ? (
                  <div>
                    <H6 className="mb-1">Website</H6>
                    <Link to={mentor.website ?? ""}>{mentor.website}</Link>
                  </div>
                ) : null}
                <div className="flex space-x-2">
                  {mentor.github ? (
                    <Link to={mentor.github ?? ""}>
                      <FontAwesomeIcon className="h-7 w-7" icon={faGithub} />
                    </Link>
                  ) : null}
                  {mentor.twitter ? (
                    <Link to={mentor.twitter ?? ""}>
                      <FontAwesomeIcon className="h-7 w-7" icon={faTwitter} />
                    </Link>
                  ) : null}
                  {mentor.linkedIn ? (
                    <Link to={mentor.linkedIn ?? ""}>
                      <FontAwesomeIcon className="h-7 w-7" icon={faLinkedin} />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorPage;
