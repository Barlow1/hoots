export async function createRoom(name?: string) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${(window as any).env.VITE_TELNYX_BEARER_TOKEN}`,
    },
    body: JSON.stringify({
      enable_recording: false,
      max_participants: 2,
      unique_name: name || undefined,
    }),
  };

  try {
    const response = await fetch(
      "https://api.telnyx.com/v2/rooms",
      requestOptions
    ).then((resp) => resp.json());
    const result = response.data;
    return result.id;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error message: ", error.message);
      return error.message;
    }
    console.log("unexpected error: ", error);
    return "An unexpected error occurred";
  }
}

export async function generateToken(roomId: string) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${(window as any).env.VITE_TELNYX_BEARER_TOKEN}`,
    },
    body: JSON.stringify({
      token_ttl_secs: 600,
      refresh_token_ttl_secs: 3600,
    }),
  };

  try {
    const response = await fetch(
      `https://api.telnyx.com/v2/rooms/${roomId}/actions/generate_join_client_token`,
      requestOptions
    ).then((resp) => resp.json());
    const result = response.data;
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error message: ", error.message);
      return error.message;
    }
    console.log("unexpected error: ", error);
    return "An unexpected error occurred";
  }
}

export default createRoom;
