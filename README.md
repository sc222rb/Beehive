# Beehive
Mobile Beehive Platform Monitoring REST API

## Description
This project provides a REST API to comprehensively monitor mobile beehive platforms. This API is designed to comprehensively monitor mobile beehive platforms and provide authenticated access to honeybee data. It utilizes a dataset to mock real-life sensor data.

## Dataset
This API uses the Beehive metrics dataset from Kaggle to mock some of the real-life sensor data: [Beehive metrics on Kaggle](https://www.kaggle.com/datasets/se18m502/bee-hive-metrics/data) Although the link contains additional files, I have selected only the following four files: 'flow_2017.csv', 'humidity_2017.csv', 'temperature_2017.csv', and 'weight_2017.csv'. I have also updated the location name from Wurzburg to Kalmar. This dataset encompasses hive flow, humidity, temperature, and weight data for the year 2017.

## Features
* Hive Status: Get the latest status values (location, humidity, weight, and temperature) for a specific beehive.
* Hive Humidity: Fetch humidity data for a specific hive over a given period.
* Hive Weight: Retrieve weight data for a specific hive over a given period.
* Hive Temperature: Get temperature data for a specific hive over a selected timeframe.
* Hive Arrival & Departure Flow: Fetch the number of bee arrivals and departures from a specific hive within a selected timeframe.
* Hive Management: Register, update, or delete beehives.
* Honey Harvesting: Farmers can report the amount of honey harvested on a certain date.
* Subscribe/Unsubscribe to Harvest Reports: Subscribe to receive harvest reports for specific hives. When a harvest occurs, receive a notification via HTTP POST to your specified postUrl, including the hive ID and harvest amount. Unsubscribe when no longer needed.
