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
      data: {enable_recording:false,max_participants:2}
  };
  
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer KEY0181B6DECC71CD9E97B9D3190B23495D_uynCmXv11YVl5BBr6gENX5'
    },
    body: JSON.stringify({ "enable_recording":false,"max_participants":2,"unique_name": name || undefined })
  };

  try {
    const response = await fetch('https://api.telnyx.com/v2/rooms', requestOptions).then(response => response.json());
    //const response = await request('post', options.url, undefined, options.data, options.options);

    const result = response.body;

    console.log(result.data.id);

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
