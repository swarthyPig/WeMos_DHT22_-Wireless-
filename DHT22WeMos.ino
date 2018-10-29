#include <ESP8266WiFi.h>
#include "DHT.h"
#define DHTTYPE DHT22

const char* ssid = "BlackPig";
const char* password = "dy**909090";
//const char* ssid = "chaoslab1";
//const char* password = "biochaos";

WiFiServer server(80);


const int DHTPin = 2; // weMos 핀맵에따라 D4에 연결한다

DHT dht(DHTPin, DHTTYPE);

static char celsiusTemp[7];
static char fahrenheitTemp[7];
static char humidityTemp[7];

void setup() {
  Serial.begin(115200);
  delay(10);

  dht.begin();
  
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  delay(10000);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  
  server.begin();
  Serial.println("Web server running. Waiting for the ESP IP...");
  delay(10000);
  
  Serial.println(WiFi.localIP());
}

void loop() {
  WiFiClient client = server.available();
  
  if (client) {
    Serial.println("New client");

    boolean blank_line = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        
        if (c == '\n' && blank_line) {
           
            float h = dht.readHumidity();
            float t = dht.readTemperature();
            float f = dht.readTemperature(true);
           
            if (isnan(h) || isnan(t) || isnan(f)) {
              Serial.println("Failed to read from DHT sensor!");
              strcpy(celsiusTemp,"Failed");
              strcpy(fahrenheitTemp, "Failed");
              strcpy(humidityTemp, "Failed");         
            }
            else{  
              dtostrf(t, 6, 2, celsiusTemp);   
              dtostrf(f, 6, 2, fahrenheitTemp);         
              dtostrf(h, 6, 2, humidityTemp);
              
              Serial.print("Humidity: ");
              Serial.print(h);
              Serial.print(" %\t Temperature: ");
              Serial.print(t);
              Serial.print(" *C ");
              Serial.print(f);
              Serial.println(" *F");
            }
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: text/html");
            client.println("Connection: keep-alive");
            client.println("Refresh: 2");
            client.println();
 
            client.println("<!DOCTYPE HTML>");
            client.println("<html>");
            client.println("<head></head>");
            client.print("<body><h1>weMos - Temperature and Humidity</h1>");
            client.print("<dl id='data'><dt class='Celsius'>");
            client.print("<h2>Temperature in Celsius : ");
            client.print(celsiusTemp);
            client.print(" *C</h2></dt><dt class='Fahrenheit'>");
            client.print("<h2>Temperature in Fahrenheit : ");
            client.print(fahrenheitTemp);
            client.print(" *F</h2></dt><dt class='Humidity'>");
            client.print("<h2>Humidity : ");
            client.print(humidityTemp);
            client.print(" %</h2></dt></dl>");
            client.print("</body>");
            client.println("</html>");  
            break;
        }
        if (c == '\n') {
          blank_line = true;
        }
        else if (c != '\r') {
          blank_line = false;
        }
      }
    }  
    delay(1);
    client.stop();
    Serial.println("Client disconnected.");
  }
}  
