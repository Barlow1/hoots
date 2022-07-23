import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";

type Route = MakeGenerics<{
  LoaderData: { id: string };
  Params: { id: string };
}>;

export const loader: LoaderFn<Route> = async ({ params }) => {
  return { id: params.id };
};

export const RoomPage = () => {
  const { data } = useMatch<Route>();
  console.log(data);
  return (
    <div>
      <h1>Room pls {data.id}</h1>
    </div>
  );
};

export default RoomPage;
