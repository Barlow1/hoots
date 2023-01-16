import type { Mentor } from "@prisma/client";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FilterValues } from "~/components/FilterDialog";
import FilterDialog from "~/components/FilterDialog";
import { getSocialMetas } from "~/utils/seo";
import { getDisplayUrl } from "~/utils/url";
import { H3, Paragraph } from "~/components/Typography";
import Tag from "~/components/Tag";
import Button from "~/components/Buttons/IconButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { routes } from "../../routes";

type Route = {
  data: { mentors: Mentor[] };
};

const TAG_LIMIT = 5;

const buildMentorFetchUrl = (
  baseUrl: string | undefined,
  query: string | null,
  minCost: string | null,
  maxCost: string | null
) => {
  let getMentorsUrl = `${baseUrl}/.netlify/functions/get-mentors`;

  if (query || minCost || maxCost) {
    const params = new URLSearchParams({
      query: query || "",
      min_cost: minCost || "",
      max_cost: maxCost || "",
    });
    getMentorsUrl += `?${params}`;
  }
  return getMentorsUrl;
};

export const meta: MetaFunction = ({ parentsData }) => {
  const { requestInfo } = parentsData.root;
  return getSocialMetas({
    url: getDisplayUrl(requestInfo),
    title: "Find a mentor",
    description: "Find a mentor who gives a hoot!",
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const minCost = url.searchParams.get("min_cost");
  const maxCost = url.searchParams.get("max_cost");

  const mentors = await fetch(
    buildMentorFetchUrl(baseUrl, query, minCost, maxCost)
  )
    .then((reponse) => reponse.json())
    .then((mentorList) =>
      mentorList.map((mentor: any) => {
        if (mentor._id) {
          return { ...mentor, id: mentor._id.$oid };
        }
        return mentor;
      })
    )
    .catch(() => {
      console.error(
        "Failed to get mentors, please try again in a few minutes."
      );
    });
  return json({ data: { mentors: mentors as Mentor[] } });
};

function Browse() {
  const [query, setQuery] = useState<string>("");
  const { data } = useLoaderData<Route>();

  const location = useLocation();
  const navigate = useNavigate();
  const updateQueryAndNavigate = async () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("query", query);
    navigate(`${location.pathname}?${searchParams}`);
  };

  const searchParams = new URLSearchParams(location.search);

  const onSearchKeyUp: React.KeyboardEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (e.key === "Enter") {
      updateQueryAndNavigate();
    }
  };

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const onFilterSave = (filterValues: FilterValues) => {
    const filterParams = new URLSearchParams(location.search);
    filterParams.set("min_cost", filterValues.min_cost.toString());
    filterParams.set("max_cost", filterValues.max_cost.toString());
    navigate(`${location.pathname}?${filterParams}`);
  };

  return (
    <div>
      <div className="grid">
        <div className="rounded-sm shadow dark:bg-zinc-800">
          <div className="flex flex-wrap-reverse justify-between p-5">
            <div>
              <div className="flex">
                <input
                  className="w-52 h-[40px] dark:text-white mt-auto mb-auto block rounded-md border-gray-300 dark:border-gray-300/20 border shadow-sm focus-visible:outline-0 focus:ring-2 focus:ring-brand-500 sm:text-sm indent-2 dark:bg-zinc-900 focus:ring-offset-2 dark:ring-offset-zinc-900"
                  name="search"
                  onChange={onSearchChange}
                  placeholder="Search..."
                  onKeyUp={onSearchKeyUp}
                  defaultValue={searchParams.get("query") ?? undefined}
                />
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      aria-label="Search"
                      onClick={updateQueryAndNavigate}
                      leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                      variant="primary"
                    />
                    <TooltipContent>Search</TooltipContent>
                  </TooltipTrigger>
                </Tooltip>
              </div>
              <label
                className="text-gray-500 dark:text-gray-200 text-sm ml-1"
                htmlFor="search"
              >
                Hint: try searching for "React"
              </label>
            </div>
            <FilterDialog
              onSave={onFilterSave}
              minCost={searchParams.get("min_cost") ?? undefined}
              maxCost={searchParams.get("max_cost") ?? undefined}
            />
          </div>
        </div>
      </div>

      {data.mentors && (
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 pt-5">
          {data.mentors?.map((mentor) => (
            <div
              key={mentor.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 focus-within:ring-brand-500 focus-within:ring-2 focus-within:ring-offset-2 dark:ring-offset-zinc-900	"
            >
              <Link
                className="w-full h-full"
                to={`${routes.browse}/${mentor.id}`}
              >
                <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96">
                  {mentor.img ? (
                    <img
                      src={mentor.img ?? undefined}
                      className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                    />
                  ) : (
                    <svg
                      className="h-full w-full text-gray-300 p-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-1 flex-col space-y-2 p-4">
                  <H3 className="font-bold">{mentor.name}</H3>
                  <Paragraph>💼 {mentor.occupation}</Paragraph>
                  <Paragraph>🏢 {mentor.company}</Paragraph>
                  <Paragraph>🕒 {mentor.experience} years</Paragraph>
                  <div className="flex">
                    <Paragraph>💲 {mentor.cost || "FREE"}</Paragraph>
                    <span className="ml-1 text-lg font-medium text-gray-500 dark:text-gray-400">
                      {mentor.cost ? "/ month" : null}
                    </span>
                  </div>
                  <div className="flex flex-wrap">
                    {mentor.tags.slice(0, TAG_LIMIT).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <Paragraph className="line-clamp-3 text-ellipsis">
                    {mentor.bio || "-"}
                  </Paragraph>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      {!data.mentors?.length && (
        <Paragraph>
          No results found. Please update your search and try again.
        </Paragraph>
      )}
    </div>
  );
}

export default Browse;
