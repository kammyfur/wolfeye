#!/bin/bash

x_run () {
  cd /mnt/wolfeye-js
  node /mnt/wolfeye-js/index.js
  x_run
}

x_run