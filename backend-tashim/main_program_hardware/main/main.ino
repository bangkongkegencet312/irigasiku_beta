// ======================================================
// ESP32 + MQTT + PH + TDS + DS18B20
// TDS menggunakan GPIO35
// ======================================================

// ======================
// LIBRARY
// ======================

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

#include <OneWire.h>
#include <DallasTemperature.h>

// ======================
// WIFI
// ======================

const char* ssid = "XPR9FE";
const char* wifi_password = "a87acz6sczsay8t";

// ======================
// MQTT
// ======================

const char* mqtt_server =
"9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud";

const int mqtt_port = 8883;

const char* mqtt_username = "tetomiku";
const char* mqtt_password = "TetoMiku1";

// ======================
// PIN SENSOR
// ======================

#define PH_PIN 34
#define TDS_PIN 35
#define ONE_WIRE_BUS 13

// ======================
// OBJECT
// ======================

WiFiClientSecure espClient;

PubSubClient mqttClient(espClient);

OneWire oneWire(ONE_WIRE_BUS);

DallasTemperature sensors(&oneWire);

// ======================
// KALIBRASI
// ======================

float calibration_value = 21.34;

// ======================
// FUNGSI RATA ADC
// ======================

int getAverageADC(int pin) {

  int total = 0;

  for (int i = 0; i < 20; i++) {

    total += analogRead(pin);

    delay(10);
  }

  return total / 20;
}

// ======================
// WIFI CONNECT
// ======================

void setupWiFi() {

  Serial.println();
  Serial.print("Menghubungkan WiFi ");

  WiFi.begin(ssid, wifi_password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());
}

// ======================
// MQTT CONNECT
// ======================

void reconnectMQTT() {

  while (!mqttClient.connected()) {

    Serial.print("Menghubungkan MQTT...");

    String clientID = "ESP32Client-";
    clientID += String(random(0xffff), HEX);

    if (mqttClient.connect(
          clientID.c_str(),
          mqtt_username,
          mqtt_password)) {

      Serial.println("MQTT Connected");
    }

    else {

      Serial.print("MQTT Failed rc=");
      Serial.println(mqttClient.state());

      delay(5000);
    }
  }
}

// ======================
// SETUP
// ======================

void setup() {

  Serial.begin(115200);

  // ADC CONFIG
  analogReadResolution(12);

  analogSetPinAttenuation(PH_PIN, ADC_11db);
  analogSetPinAttenuation(TDS_PIN, ADC_11db);

  // SENSOR SUHU
  sensors.begin();

  // WIFI
  setupWiFi();

  // SSL
  espClient.setInsecure();

  // MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);

  Serial.println("System Ready");
}

// ======================
// LOOP
// ======================

void loop() {

  // MQTT reconnect
  if (!mqttClient.connected()) {

    reconnectMQTT();
  }

  mqttClient.loop();

  // ==========================================
  // BACA SUHU
  // ==========================================

  sensors.requestTemperatures();

  float temperature =
    sensors.getTempCByIndex(0);

  // ==========================================
  // BACA PH
  // ==========================================

  int adcPH = getAverageADC(PH_PIN);

  float voltagePH =
    adcPH * (3.3 / 4095.0);

  float phValue =
    -5.70 * voltagePH + calibration_value;

  // ==========================================
  // BACA TDS
  // ==========================================

  int adcTDS = getAverageADC(TDS_PIN);

  // DEBUG ADC
  Serial.print("ADC TDS : ");
  Serial.println(adcTDS);

  float voltageTDS =
    adcTDS * (3.3 / 4095.0);

  Serial.print("Voltage TDS : ");
  Serial.println(voltageTDS);

  // kompensasi suhu
  float compensationCoefficient =
    1.0 + 0.02 * (temperature - 25.0);

  float compensationVoltage =
    voltageTDS / compensationCoefficient;

  // rumus TDS
  float tdsValue = (
    133.42 *
    compensationVoltage *
    compensationVoltage *
    compensationVoltage

    - 255.86 *
    compensationVoltage *
    compensationVoltage

    + 857.39 *
    compensationVoltage
  ) * 0.5;

  // FILTER NILAI NEGATIF
  if (tdsValue < 0) {

    tdsValue = 0;
  }

  // ==========================================
  // MQTT PUBLISH
  // ==========================================

  mqttClient.publish(
    "sensor/ph",
    String(phValue, 2).c_str()
  );

  mqttClient.publish(
    "sensor/tds",
    String(tdsValue, 0).c_str()
  );

  mqttClient.publish(
    "sensor/suhu",
    String(temperature, 2).c_str()
  );

  // ==========================================
  // SERIAL MONITOR
  // ==========================================

  Serial.println("========== DATA ==========");

  Serial.print("PH : ");
  Serial.println(phValue);

  Serial.print("TDS : ");
  Serial.print(tdsValue);
  Serial.println(" ppm");

  Serial.print("Suhu : ");
  Serial.print(temperature);
  Serial.println(" C");

  Serial.println("==========================");

  delay(2000);
}