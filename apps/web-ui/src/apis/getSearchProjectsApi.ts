import axios from "axios";

export function getSearchProjectAPI(keyWord: any) {

  axios.get(`https://api.github.com/search/users?q=${keyWord}`).then(

    response => {
      console.log('请求成功了');
      // 请求成功后更新List的数据

    },

    error => {
      console.log('请求失败了', error.message);
      // 请求失败后更新List的数据

    }

  )

}