import { ArrowBackIcon, TimeIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Text,
  Link,
} from "@chakra-ui/react";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEllipsis, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Mentor } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Link as NavLink,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { getFacebookHref } from "~/utils/facebook";
import { getLinkedInHref } from "~/utils/linkedIn";
import { getSocialMetas } from "~/utils/seo";
import { getTwitterHref } from "~/utils/twitter";
import { getDisplayUrl } from "~/utils/url";

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

export const MentorPage = () => {
  const { data } = useLoaderData<LoaderData>();
  const mentor = data.mentor;
  const shareUrl = data.shareUrl;
  const title = `I'm mentoring on Hoots 🦉 Can't wait to meet with you!`;
  return (
    <Box justifyContent={"center"} key={mentor?.id}>
      <Flex w="full" justifyContent={"space-between"} mb="5">
        <Button
          leftIcon={<ArrowBackIcon />}
          onClick={() => {
            window.history.back();
          }}
        >
          Back
        </Button>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FontAwesomeIcon icon={faEllipsis} />}
          ></MenuButton>
          <MenuList>
            <MenuItem
              as={Link}
              icon={<FontAwesomeIcon icon={faTwitter} />}
              href={getTwitterHref({
                url: shareUrl,
                title,
              })}
              isExternal
            >
              Share on Twitter
            </MenuItem>
            <MenuItem
              as={Link}
              icon={<FontAwesomeIcon icon={faLinkedin} />}
              href={getLinkedInHref({
                url: shareUrl,
              })}
              isExternal
            >
              Share on LinkedIn
            </MenuItem>
            <MenuItem
              as={Link}
              icon={<FontAwesomeIcon icon={faFacebook} />}
              href={getFacebookHref({
                url: shareUrl,
              })}
              isExternal
            >
              Share on Facebook
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Flex justifyContent={"center"} maxW="xl" mx={"auto"}>
        <Flex direction={"column"}>
          <Flex justifyContent={"center"} pb={5}>
            <Avatar size="2xl" src={mentor?.img ?? undefined} />
          </Flex>
          <Heading as="h2" size="lg" noOfLines={1}>
            {mentor?.name}
          </Heading>
          <Text>💼 {mentor?.occupation}</Text>
          <Text>🏢 {mentor?.company}</Text>
          <Text>🕒 {mentor?.experience} years</Text>
          <Text>💲 {mentor?.cost || "FREE"}</Text>
          <Flex py={1} wrap={"wrap"}>
            {mentor?.tags.map((tag: any) => {
              return (
                <Tag
                  key={tag}
                  background="brand.500"
                  color="white"
                  mr={1}
                  mb={1}
                >
                  {tag}
                </Tag>
              );
            })}
          </Flex>
          <Text>{mentor?.bio}</Text>
          <Button
            backgroundColor={"brand.500"}
            _hover={{ bg: "brand.200" }}
            style={{ color: "white" }}
            justifySelf="center"
            as={NavLink}
            to={"apply"}
            mt={5}
            w="full"
            mx={"auto"}
          >
            Apply{" "}
            <FontAwesomeIcon
              icon={faPaperPlane}
              style={{ marginLeft: "0.5em" }}
            />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default MentorPage;
