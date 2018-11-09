# WeMos_DHT22_Wireless

## 18/11/09 
* 포트포워딩시 socket.io에서 클라이언트로 데이터 전송이 되지 않는 문제를 해결하였다.
* 답은 express-generator를 사용하고 express 와 socket.io 부분에 cors(Cross-Origin Resource Sharing) 설정을 해주므로써 
  해결되었다.
------------------------------------------------------------------------------------------------------------------------

## DHT22WeMos.ino

* WeMos와 DHT22를 사용하여 동적으로 html페이지를 생성해서 온습도 값을 볼 수 있습니다.

* weMos 핀맵에따라 D4에 연결한다, 코드에서 DHTpin은 2번으로 합니다.
  ```c
  const int DHTPin = 2; 
  ```
  
* 자신이 사용하는 공유기의 와이파이 이름과 비밀번호를 입력하고 시리얼 모니터로 웹페이지가 생성될 내부 아이피를 
  볼 수 있습니다. 
  ```c
  const char* ssid = "wifi name";
  const char* password = "wifi password";
  ```
  
* 웹페이지를 2초에 한번씩 refresh 합니다.
  ```
  client.println("Refresh: 2"); 
  ```
------------------------------------------------------------------------------------------------------------------------

## index.js

* WeMos에서 동적으로 생성한 웹페이지의 온습도 데이터를 **cheerio** 모듈을 사용하여 **Scraping** 합니다. 
  **Scraping**한 온습도 데이터를 **배열**에 담은 후 **socket.io**를 사용하여 클라이언트에게 **emit** 합니다.

* 먼저 **Scraping** 을 하기위해서 **cheerio** 와 **request** 을 **require** 합니다 
  ```javascript
  var cheerio = require('cheerio');
  var request = require('request');
  ```
  
* **Scraping** 하는 과정을 화씨와 습도는 동일한 방법이므로 대표로 섭씨 온도만 설명하겠습니다.
  ```javascript
  var url = 'http://192.168.0.11/';  // WeMos에서 띄워준 내부아이피 주소입니다

  var Celsius = '';  // 섭씨 온도를 담을 변수를 전역변수로 선언합니다

  function getCelsius() { // 이름이 getCelsius인 함수를 생성합니다.

    request(url, function (err, res, body) { // 지정된 url에 request하여 body값으로 html 코드를 받아옵니다

        var $ = cheerio.load(body); // 받아온 html 코드를 cheerio를 사용하여 $변수에 넣습니다.

        $('#data .Celsius').each(function () { // id가 data인 태그안에 class를 Celsius로 지정한 태그안에서 값을 긁어옵니다.
            Celsius = $(this).text().substring(26, 31); // 긁어온 값을 text()로 받고 substring으로 필요한 부분만 잘라서 
                                                        // Celsius 변수 안에 넣습니다.
            //console.log(Celsius);
        });
    });
      return Celsius; // 섭씨온도 데이터가 담긴 Celsius변수값을 리턴해줍니다.
  }
  ```
  
* **Scraping** 한 데이터를 배열에 담아서 **emit** 하는 부분입니다.(**socket.io** 설정 부분은 생략함.)
  ```javascript
  var dht22data = []; // 온습도 데이터를 담을 배열을 선업합니다.
    
  setInterval(function () { // 아두이노 페이지가 2초마다 refresh되므로 마찬가지로 Scraping 부분도 반복시켜줍니다.
    var dateStr = getDateString(); // data가 들어온 시기를 나타내는 date를 변수에 담습니다.
    var CelsiusData = getCelsius(); // 섭씨 온도 데이터를 변수에 담습니다.
    var FahrenheitData = getFahrenheit(); // 화씨 온도 데이터를 변수에 담습니다.
    var HumidityData = getHumidity(); // 습도 데이터를 변수에 담습니다.
    dht22data[0] = dateStr; // Date
    dht22data[1] = CelsiusData; // temperature data
    dht22data[2] = FahrenheitData; // Fahrenheit data
    dht22data[3] = HumidityData; // humidity data
    // 각각의 데이터를 배열의 0번인덱스부터 3번인덱스 까지 담습니다.
    io.sockets.emit('message', dht22data); // socket.io를 사용하여 클라이언트 페이지에 데이터를 담은 배열을 전송합니다.
    console.log(dht22data);
  }, 3000); // 이 반복(setInterval)은 3초마다 실행됩니다.
  ```
------------------------------------------------------------------------------------------------------------------------
## pm2(process manager)

* node.js 개발도구로 **Brackets** 을 사용하였고 process manager인 **pm2** 를 사용하였습니다. 

* 설치 
  ```
  npm install pm2 
  ```
  
* 실행 ==>여기서 --watch를 추가하면 코드가 변경되었을때 저장하는 순간 서버가 **auto-restart** 됩니다.
  ```
  pm2 start main.js --watch
  ```
  
* 중지 
  ```
  pm2 stop main.js
  ```
  
* LOG ==> 각종 오류 메세지들과 console 값을 볼 수 있습니다.
  ```
  pm2 log
  ```
  
* Monitoring ==> 돌고있는 서버와 console 값 등등 많은 정보들을 볼 수 있습니다.
  ```
  pm2 monit
  ```
  
* Server Kill ==> 아래 코드를 cmd창에 입력하면 현재 어느 port 이든지 node로 실행되고있는 server를 모두 Kill할 수 있습니다.
  ```
  taskkill /F /IM node.exe
  ```
  
* 더 자세한 정보는 http://pm2.keymetrics.io/ 이 사이트를 참조하십시오.
