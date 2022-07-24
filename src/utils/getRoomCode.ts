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
      data: {body: {enable_recording:false,max_participants:2}}
  };
  
  try {
    const response = await request('post', options.url, undefined, options.data, options.options);

    const result = (JSON.parse(response.data));

    console.log(result.data.id);

    return result.data.id;
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
