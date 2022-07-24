import post from 'node-fetch';
import { request } from './request';

async function createRoom(name?: string) {
  
  const options = {
      url: 'https://api.telnyx.com/v2/rooms',
      method: 'POST',
      options: {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer KEY0181B6DECC71CD9E97B9D3190B23495D_uynCmXv11YVl5BBr6gENX5'
        }
      },
      body: {
        unique_name: name || 'test name',
        max_participants: 2,
        webhook_event_url: "webhook_event_url",
        enable_recording: false,
      }
  };
  
  try {
    const response = await request('post', options.url, undefined, options.body, options.options);

    const result = (response);

    console.log('result is: ', JSON.stringify(result, null, 4));

    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    } else {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }
}

export default createRoom;
