# G.Nautilus <-> Node.js Server
Basics for the interaction between the G.Nautilus headset and a Node.js server to store the EEG data into a database

**Before starting make sure that any computer being used is on the WPA-PSK network**

## Streaming Data From G.Nautilus With MATLAB
1. Connect the G.Nautilus key (Green Flashdrive) to the Lab Computer.
2. Connect the G.Nautilus receiver to the Lab Computer using the USB cable.
3. Power on the G.Nautilus transmitter, attached to the EEG cap.
4. Open matlab and start streaming data
    1. Open Matlab
    2. Open the tm2 folder within matlab ("D:\Documents\MATLAB\tm2\")
    3. If the tm2 folder hasn't been added to path, select add to path and add with subfolders `D:\Documents\MATLAB\tm2\`
    4. Add the java object file
5. Run the simulink file by double clicking on it in the left side panel
6. Double click on the first node in the graph that opens, once the cap is found exit the popup
7. Select the run button from the top of MATLAB

## Capturing and Storing Data With Node.js
1. Find the IP address of the Lab Computer
2. Edit the simple.js file to ensure that `MASTER_IP` matches the Lab Computer
3. From powershell or command prompt navigate to the folder containing simple.js and run `node simple.js`
4. Ensure that the command prompt is showing that a connection is established and that data is being saved
5. Press `Ctl + C` to terminate the server. It will close gracefully on close the database connection
6. 2 Databases will be created. readings.db contains the EEG raw data and markings.db contains any messages.

## Sending Mark Data to the Node.js server
1. Create a program that uses websockets that connect to the IP of the computer storing the database.
2. Send messages in a JSON with:
```
{ 
  time: Date.now(),
  type: "[Marking Type]",
  value: "[Marking Value]"
}
```
3. For compatability with epochData.js use `type: "Mark"` for any marking to be cut on.
4. View the example client, specifically the send functions starting on line 156 to see examples of sending marking data.

## Analyzing the Data
1. Using DB Browser open the readings.db database
2. Right click on a table name select `export as csv file`
3. Open EDF Browser 
4. Select `Tools -> Convert ASCII (CSV) to EDF/BDF`
5. Set: `Column separator` to `,`
6. Set: `Number of columns` to 16
7. Set: `Data starts at line` to 1
8. Set: `Samplefrequency` to `250.0 Hz`
9. Set: `Signals -> Physical dimension` to `uV`
10. Set: `Signals -> Label` to the EEG Node position corresponding to the channel number
    - [ ] Upload the template for standard cap positions
11. The EEG data can now be opened with EDF browser, MATLAB, or BCI.js

## Epoching the Data Using the Markings Database
1. Modify the epochData.js file to match the csv filename, marking names to epoch around and time for each epoch
    - [ ] Upload epochData.js so that it can be modified for other marking formats
