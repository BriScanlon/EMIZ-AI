import os
import pprint
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, HTTPException, File, UploadFile, Body, Query
from langchain_community.document_loaders import TextLoader
from langchain.schema import Document
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from neo4j import GraphDatabase
import logging
from process_document import process_document
from langchain_ollama.llms import OllamaLLM
from neo4j import GraphDatabase
import pandas as pd

# environment settings
NEO4J_URI = "bolt://neo4j-db-container"
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = "TestPassword"

# ollama settings
llm = OllamaLLM(base_url="http://ollama-container:11434", model="phi4", temperature=0)
llm_transformer = LLMGraphTransformer(llm=llm)

# chunk settings
CHUNK_SIZE = 3000
CHUNK_OVERLAP = 150

# second test text
text = """
© Crown copyright 2010 16
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
ACCIDENT
Aircraft Type and Registration: De Havilland Canada DHC-6 300 Twin Otter, C-FAKB
No & Type of Engines: 2 Pratt & Whitney PT6A-27 turboprop engines
Year of Manufacture: 1969 serial number 273
Date & Time (UTC): 24 February 2010 at 0057 hrs
Location: London Gatwick Airport
Type of Flight: Ferry flight
Persons on Board: Crew - 2 Passengers - None
Injuries: Crew - None Passengers - N/A
Nature of Damage: Electrical fire in cabin
Commanders Licence: Air Transport Pilots Licence
Commanders Age: 38 years
Commanders Flying Experience: 10,018 hours (of which 8,560 hours were on type)
Last 90 days - 95 hours
Last 28 days - 23 hours
Information Source: AAIB Field Investigation
Synopsis
During a ferry flight from Calgary, Canada to the Maldives, an electrical fire started in the power distribution and generator control box located in the roof of the passenger cabin. The crew isolated the electrical systems and successfully diverted to London Gatwick Airport. The source of the fire was traced to the left generator reverse current relay, which was found to have a different part number to the relays authorised for use on the DHC-6 series of aircraft.
Five Safety Recommendations were made.
Background information
C-FAKB was going to make a series of positioning flights starting from Calgary, Canada, finishing in the Maldives. The passenger seats were removed from the aircraft to create space for two 925 litre fuel tanks, which were attached to the floor rails in the cabin and connected to the main fuel system. Two 45 gallon drums were secured to the rear bulkhead in the cabin and one was secured to the floor points behind the forward bulkhead. The drums were filled with fuel, which was to be manually transferred to the 925 litre tanks if unfavourable headwinds were experienced during any of the long over-water legs. Immediately behind the flight deck, on the right side, was an oxygen cylinder, which provided supplementary oxygen to the crew through two
© Crown copyright 2010 17
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
constant-flow nasal cannula hoses. This allowed the unpressurised aircraft to operate at higher flight levels than would otherwise have been the case.
The first leg, from Calgary to Iqualuit, was planned for 20 February 2010. After starting the right engine, the crew noticed that the right generator caution light failed to illuminate after the start switch was released and so the engine was shut down in accordance with the Emergency Checklist. Following work by engineers to diagnose the problem, it was decided to replace the right engine reverse current relay (RCR) and, when the rectification work was complete, the generator functioned correctly.
The aircraft flew three flights, during which the crew experienced no further problems, and at the end of the third flight it landed at Birmingham Airport.
History of the flight
On 23 February 2010, C-FAKB departed from Birmingham Airport at 2336 hrs and climbed to FL170 for a flight to Dubrovnik, Croatia. A few minutes after levelling off for the cruise, the captain noticed “two brief flickers” of the left generator caution light. After discussion with the co-pilot, the commander opened the DC bus tie in order to separate the two DC generator busbars electrically. This action was known to enable continued operation of both generators in circumstances where they were not properly balanced.
Approximately five minutes later, the commander noticed a faint smell, but he and the co-pilot saw nothing abnormal. The crew discussed the symptoms they had observed but decided not to reset the left generator because there had been no steady generator
caution light. A few minutes later, they noticed a “dim orange flickering glow” between two ceiling panels on the right side of the cabin close to the location of both RCRs. The commander declared an emergency and asked for assistance from ATC to land at the nearest suitable airport. The aircraft was at FL170 overhead the River Thames estuary near Manston, but Manston Airport was closed, as was Lydd Airport. Ostend Airport, Belgium, was 58 nautical miles away but the crew did not wish to fly for that distance over the sea. Southend Airport was open but there was broken cloud at 200 ft aal and the crew decided the weather was not suitable to make an approach. After further discussion with ATC, the crew decided to make an approach to Runway 26L at London Gatwick Airport.
While trying to identify the fault, the crew saw that the left generator load meter was showing a full scale deflection to the left, and that the right generator load meter was deflected to the right although not to full scale. The nature of the problem was not obvious to the crew and there was no applicable procedure in the Emergency Checklist. Nevertheless, the pilots decided to shut down the right generator because it was the RCR associated with the right generator that had caused the problem they experienced in Calgary. After shutting down the generator, the right generator caution light remained off. During the descent, the crew switched off unnecessary electrical items as well as equipment that the pilots believed had wiring that ran close to the RCRs. The commander also went into the cabin to turn off the supplementary oxygen. There was no obvious improvement in the symptoms they could see in the cabin and so the crew decided to switch off the left generator, leaving the battery as the only source of electrical power. The left generator caution light also remained off although the captain considered that this might have been because he had tripped a large number of circuit breakers.
© Crown copyright 2010 18
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
During the final approach to Gatwick Airport, the crew thought that the glow behind the ceiling panels had reduced, but a heat blister had developed on the cabin side of the panels and it was smoking slightly. The aircraft landed, taxied clear of the runway and the crew attempted to shut down the engines. The left engine shut down correctly but, after shutting off the fuel to the right engine it continued to run at between 12% to 15% Ng. The captain thought that the starter motor was probably engaged and stopped the engine by selecting the battery Master Switch to off .
The airport fire crew attended the aircraft and determined that the temperature in the vicinity of the RCRs was slowly increasing. Therefore, they disconnected the aircraft battery from the electrical system and remained with the aircraft until they were satisfied that there was no longer a risk of a fire.
Description of the aircraft DC electrical system
General
The aircraft is equipped with a 28VDC electrical system. Each engine is fitted with a starter-generator, which supplies electrical power to its respective DC busbar through a reverse current relay RCR, see Figure 1. A secondary source of DC power is a 24V battery, which feeds the left DC busbar through the battery bus and reverse current circuit breaker. During normal operation the left and right DC busbars are connected by the bus tie, which allows both systems to operate in parallel. The left and right DC electrical systems can operate as separate systems by opening the DC bus tie. A load meter allows the crew to determine the current flowing into or out of the starter generator, its scale indicates between +1 and –1, which corresponds to +200 amps and -200 amps. Movement of the pointer to the instrument stops corresponds to approximately 400 amps.
Figure 1
Simplified diagram of aircraft DC electrical generation
5 amp gen CBreversecurrent relayleft dc busS/Gdc bus tieS/G5 amp gen CBreversecurrent relayright dc busstarter/generatorstarter/generatorloadmeterloadmeterreversecurrent CBbatterybusbattery
© Crown copyright 2010 19
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
Reverse current relays
The purpose of the RCR is to provide a connection between the generator and the bus, or battery, and to provide reverse current protection in the event of a generator failure or a loss of generator voltage. The RCRs are located within the power distribution and generator control box, which is mounted in the roof on the right side of the cabin. Each RCR contains three relays (Figure 2). Relay R1 operates when the generator voltage reaches approximately 22V, relay R2 is a polarized differential relay which senses the direction of the current flow and relay R3 operates the main contacts. A generatorGENERATOR caution light, located on the instrument panel in the cockpit, illuminates when the main contact is open and the engine start switch is at the off position.
The sequence of operation of the RCR is as follows. When the generator voltage reaches approximately 22V, relay R1 closes. This energises relay R2, which is connected across the open main contacts. The voltage on the Diff Volt coil of relay R2 is now the difference between the generator voltage and the battery / bus voltage. When this difference reaches between 0.35V and 0.65V (generator must be the highest voltage) relay R2 will close. This applies a voltage to the Main Relay coil R3, which immediately closes and connects the generator to the bus. If the generator voltage decreases below the battery / bus voltage, a current will flow from the bus to the generator. The Rev Current coil in Relay R2 senses the change in direction of the current and the contact opens. The Main Relay coil in Relay R3 is then de-energised, the main contacts open and the generator is disconnected from the bus.
The drawing for the power distribution and generator control (No C6NF1171) lists the part numbers for RCRs approved for use on the DHC-6 as A-700AP and A-700AAP, rated at 300 amps, and A-701D, rated at 400 amps.
Voltage regulator
A voltage regulator is fitted in each generator circuit and controls the generator output at a nominal 28.5V over the full range of generator speed, load and operating temperature. An equalizer circuit in each voltage regulator ensures equal loading (within 20 amps) when the generators are operating in parallel.
Examination of the aircraft
Examination of the aircraft revealed that there had been an electrical fire, which had almost consumed the left RCR, Figure 3. The fire had burnt through the cover of the power distribution and generator control box and, whilst the heat had caused the trim in the cabin to blister,
Gen control Gen caution light
Figure 2
Schematic diagram of reverse current relay
© Crown copyright 2010 20
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
the trim remained intact and there was no evidence of any smoke damage in the cabin. The trail of the combustion products shows that the smoke remained trapped between the fuselage and cabin trim and was drawn out of the cabin vent mounted in the roof of the aircraft. The heat had also damaged the wiring for the entertainment system and the aerial for a redundant ADF system; there was no other damage to any of the aircraft wiring. Although the adjacent structure and components were covered with combustion products there was no evidence of heat damage outside of the power distribution and generator control box, except to the adjacent cabin trim, .
Both generators were visually examined and the brushes were found to be in good condition. The 5 amp circuit breaker for the right generator, mounted near the generator relay in the engine nacelle, had tripped. The aircraft battery appeared, from a visual inspection, to be in good condition and had a voltage of 25.7v.
The power distribution and generator control box was replaced and the aircraft was flown to a maintenance organisation in Switzerland where a detailed inspection of the complete aircraft electrical system was carried out. The maintenance organisation advised the AAIB that whilst the wiring in the aircraft was in a bad general condition..... they could not find any obvious cause for the electrical fire. The complete aircraft wiring was replaced and engine ground runs were carried out to test the electrical generation and distribution system. All the systems operated satisfactorily and the aircraft was flown to the Maldives.
Previous occurrences
The Type Certificate Holder provided the AAIB with copies of their Service Difficulty Reports detailing 18 failures of the RCR since 1974. Of the 18 occurrences, 15 reports recorded that either the contacts were welded closed or there were signs of overheating, smoke or sparks. Eleven of the RCR were rated at 300 amps and five at 400 amps. There was insufficient information to establish the current rating of the remaining two RCRs.
Significant airworthiness directives, modifications and service bulletins
Airworthiness directives (AD)
AD CF-75-11 was issued by Transport Canada and became effective on 1 December 1975. The AD is applicable to DHC-6 series of aircraft and requires the inspection of the contact points on A-700AAP and A-700AP relays.
Figure 3
Damage to power distribution box and generator control box
© Crown copyright 2010 21
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
AD CF-77-08 was issued by Transport Canada and became effective on 30 September 1977. The AD is applicable to DHC-6 aircraft serial numbers 1 through 530. The AD states:
To preclude the possibility of total electrical failure due to contact welding of reverse current relays Hartman A700AP or A7000AAP and subsequent burning through of relay covers and adjacent wiring, install de Havilland Modification 6/1598 in accordance with de Havilland Service Bulletin No 6/353.
AD 78-01-05 was issued by the Federal Aviation Administration and became effective on 9 February 1978. The AD required the De Havilland modification 6/1598 and SB 6/353 to be incorporated on DHC-6 series aircraft.
De Havilland Service Bulletins
SB 6/338 was issued on 24 October 1975 and revised on 29 October 1982. This SB requires RCRs rated at 300 amps A-700AP and AAPto be removed from the aircraft and inspected at intervals of not more than 1,200 hours. The inspection requirement is to look for signs of overheating and pitting or corrosion of the contact points.
SB 6/353 was issued on 13 May 1977 and revised on 28 February 1978. This SB introduces heat shielding around the RCR and the rerouting of critical wiring away from the RCRs.
De Havilland Modifications
Modification 6/1585 introduced a new RCR, part number A-701D, rated at 400 amps.
Modification 6/1598 was approved in 1977 and reroutes the electrical wiring adjacent to the RCRs and introduces fire resistant panels in the power distribution and generator control box.
Modification state of aircraft wiring
An entry in the aircraft technical log, dated 7/12/09, stated:
U.S AWD 78-01-05 main distribution box rewiring complied with as per modification No. 6/1598 And S.B 6/353.
Examination of right RCR removed at Calgary
The right RCR (s/n A98995), which was removed at Calgary before the start of the ferry flight, was examined by the AAIB and tested by a specialist organisation. The RCR was fitted with a data plate identifying it as Part Number A-700A, rated at 300 amps. With the exception of the test for the volt relay coil (R1), and the resistance check across the generator and battery terminals, the RCR met all the requirements in the specification.
The tests established that relay R1 closed at 15V and opened at 3v. These values were outside the specified limits of 20V to 24V for closing and more than 18V for opening. The RCR was removed from its container and the relay was operated by hand before being retested. During the second test the relay closing and opening voltages were found to be 22.7V and 18.7V respectively, which is within the acceptable limits.
The resistance across the generator and battery terminals was established by measuring the voltage drop when a load bank and standard resistor were connected in series with the RCR. The measured voltage drop was 39.2 mV at 50 amps, which gave a resistance across the contacts of 0.748 mΩ. The specification states that for a maximum
© Crown copyright 2010 22
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
voltage drop of 100 mV at 300 amps, the resistance should not exceed 0.333 mΩ. Therefore the contact resistance was higher than the maximum permitted value.
The RCR appeared, from a visual inspection, to be old and the covering of the voltage relay coil (R1) had the appearance of having being degraded by heat. There was light pitting on the contacts of the main relay coil (R3) and it was noted that a fine braid, forming a connection at the differential voltage contacts, was passed around the spindle of the moving part of the differential relay R2.
Examination of power distribution and generator control box
The damage indicates that the left RCR was the source of the fire and the temperature was sufficiently high to destroy the majority of the cover and the container in which the components for the RCR are located, Figure 4.
One of the two contact faces in the main relay (R3) had welded closed and the face on the second contact had light pitting. This pitting was similar to that seen on the faces of the main contact in the right RCR which had been removed at Calgary. While the data plate had been destroyed, the components in the left RCR, and the design of the main contacts (R3), were found to be identical to the components in the right RCR that had been replaced at Calgary; the right RCR had a data plate identifying it as an A-700A relay. The documentation for the left RCR also identified it as an A-700A relay rated at 300 amps.
Four holes had been burnt through the stainless steel heat shield positioned around the left RCR, Figure 5. The holes were the result of arcing between the metal components in the left RCR and the heat shields; three of the holes were approximately 10 mm high and 20 mm long, the fourth was slightly smaller. The sides of the DC bus tie and the right RCR, which were mounted adjacent to the left RCR, had also been damaged by heat. The insulation on all the electrical control wires to the left RCR had melted and there was evidence of arcing having occurred between some of the wires
Left RCR
Figure 4
Damage to left RCR
© Crown copyright 2010 23
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
and adjacent metal components. The insulation on the electrical control wires for the right RCR had also melted where they passed through the access hole in the side of the power distribution box. The damage was such that all these wires would have shorted on the side of the power distribution box.
The routing of the wiring in the power distribution and generator control box is dependent on the modification state of the aircraft. However, the routing of the wiring did not appear to conform to any of the four drawings in SB 6/353: the installation was closest to the configuration detailed at A/S 136-310 Pre Mod 6/1274 & Pre Mod 6/1389. This was not considered to be a factor in this accident.
Examination by the Original Equipment Manufacturer
The Original Equipment Manufacturer (OEM) examined the right RCR (part number A-700A) removed at Calgary prior to the ferry flight.
The OEM was of the opinion that the RCR might have been manufactured between 1944 and 1966 when the part number A-700A became obsolete and was replaced with part number A-700AP. The OEM no longer held any drawings for the A-700A units and had no production information for either of the RCRs (part number A-700A) fitted to C-FAKB. They were, therefore, unable to determine if the RCRs were authentic components.
The OEM was not aware of any overhaul manuals having been produced for the A-700A relays. They also had no production test documentation or any other documents that contained adjustment or repair instructions. Their advice was that the relays should be discarded if they are removed from the aircraft.
History of the reverse current relays
The documentation for the RCRs fitted to the aircraft at the time of the accident and the right RCR removed at Calgary indicated that they had all been recently
Holes in heat shield Right RCRBus tie Reverse current CB
Figure 5
Damage to heat shield
© Crown copyright 2010 24
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
overhauled and had flown relatively few hours prior to the accident.
Left RCR
The left RCR (A-700A, s/n 50747) was rated at 300 amps and had been fitted to the aircraft in December 2009, 35 flying hours prior to the accident. The Authorized Release Certificate, which was dated 10/8/2009, recorded that the unit had been overhauled I.A.W. Hartman Manual A-700A. The following comment was recorded in the teardown report:
Found all contacts are pitted
and in the work accomplished section of the report the following action was recorded:
Overhaul the unit I.A.W Hartman Manual No. A-700A reqd (Polish and repair the contacts, carried out current drop test as per reqd).
Right RCR
The right RCR (A-701D, s/n CON318) was fitted at Calgary on 21 February 2010 and was rated at 400 amps. The Authorized Release Certificate, which was dated 12/17/2009, recorded that the unit had been repaired and tested I.A.W. Hartman Manual No A-700D. Rev. M Apr/1996.
Right RCR removed at Calgary
The right RCR (A-700A, s/n A98995) removed at Calgary on 21 February 2010 was rated at 300 amps and had been fitted to the aircraft on 29 November 2009. It had flown 13 flying hours before it was removed from the aircraft on 21 February 2010. The Authorized Release Certificate, which was dated 10/7/2009, recorded that the unit had been overhauled I.A.W. Hartman Manual A-700A. The following comment was recorded in the teardown report:
Found all contacts are pitted
and in the work accomplished section of the report the following action was recorded:
Overhaul the unit I.A.W Hartman Manual No. A-700A reqd (Polish and repair the contacts, carried out current drop test as per reqd).
The maintenance organisation that overhauled and repaired the RCR provided the investigation with a copy of the Hartman Manual referenced in the Authorized Release Certificate. The cover sheet of this document had the title Donallco aircraft accessories and component parts. The remainder of the document was annotated Hartman and had the title Installation Instructions for Switch, Generator Control relay (Differential) …. Manufacturers Part No A-700A). However, this document only provided information on the testing of the relay and did not contain any information as to how to overhaul or repair the component.
Inspection requirements for reverse current relays
The DHC-6 is on a 3,000 hour inspection schedule with a C check required every 500 hours. The inspection Requirements Manual (PSM 1-6-7) calls for the contacts on relays A-700AP and A-700AAP to be examined in accordance with SB 6/338 every 1,200 hours. It also calls for the relay to be removed and bench tested every 3,000 hrs during the C6 check. There is no requirement for the relays to be overhauled.
Analysis
Cause of fire
The damage to the aircraft indicates that the electrical fire started in the left RCR and the fire, and associated heat damage, did not spread outside the power distribution and generator control box.
© Crown copyright 2010 25
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
The first indication to the crew was the two brief flickers on the left generatorGENERATOR caution caption. It is likely that this was caused by the rapid opening and closing of the main contacts (R3) in the left RCR. With the left generator on-line, it is likely that this action would have resulted in arcing between the moving and fixed contact plates, which may have been sufficient to weld one of the two contacts in the closed position. When the crew checked the DC load meter they noticed that on the left system the needle was fully deflected to the left, and on the right system was partially deflected to the right. This indicates that while the right generator was providing power to the right DC bus, current of at least 400 amps was flowing into the left starter/generator. It is this current flow which most probably caused, and sustained, the electrical fire.
Although the crew had turned both generators off , and disconnected the DC bus tie, the right engine continued to turn at 12% to 15% Ng after both engines had been shut down. This shows that at the end of the flight the aircraft battery was providing electrical power to the right starter/generator, and the DC bus tie and the main contacts in the right RCR must have been in the closed position. It is, therefore, probable that the damage to the left RCR and the electrical control wires in the electrical power distribution box had already occurred before the crew attempted to disconnect the generators.
The investigation was unable to determine the reason why the main contacts (R3) in the left RCR might have started to open and close during the flight. No faults were found in the electrical wiring outside the power distribution and generator control box. After the aircraft had been rewired, and the damaged components replaced, the DC electrical generator system was found to operate satisfactorily indicating that there were no faults in the generators or voltage regulators.
The left RCR and the wiring in the power distribution and generator control box were extensively damaged and consequently it was not possible to determine if the fire had been the result of a fault in the RCR or a damaged wire that controlled the RCR.
Heat shield
As a result of previous occurrences of RCRs overheating and damaging adjacent components, Transport Canada issued an AD in 1977 that resulted in the introduction of fire resistance panels in the power distribution and generator control box. While the required modification (6/1598) had been embodied on C-FAKB, the heat shields were breached in four places as a result of arcing between the metal components in the RCR and the heat shields. Consequently the DC bus tie, right RCR, battery power cable and several electrical control cables all sustained some damage. The following Safety Recommendation is therefore made to Transport Canada:
Safety Recommendation 2010-083
It is recommended that Transport Canada reviews the design and efficacy of the heat shields fitted around the Reverse Current Relays on De Havilland DHC-6 aircraft that were introduced as a result of Airworthiness Directive CF-77-08.
Reverse current relays
The investigation established that the left RCR that failed during the accident flight and the right relay removed prior to the start of the ferry flight were both identified as A-700A relays, which is an obsolete part that has not been approved for use on the De Havilland
© Crown copyright 2010 26
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
DHC-6. The following safety recommendation is therefore made to Transport Canada:
Safety Recommendation 2010-084
It is recommended that Transport Canada takes appropriate action to ensure that only approved Reverse Current Relays are fitted to De Havilland DHC-6 aircraft.
A review of previous occurrences of overheating of the RCRs indicates that failures generally occurred due to arcing, and welding, of the main contacts and was most likely to occur on the relays rated at 300 amps (A-700AP and A-700AAP). While modification 6/1585 introduced relay A-701D, rated at 400 amps with an improved contact design, there was no requirement to replace the existing 300 amps relays providing their contacts were examined every 1,200 hours. Given that most of the occurrences of overheating appear to have occurred with the relays rated at 300 amps, the following Safety Recommendation is made to Transport Canada:
Safety Recommendation 2010-085
It is recommended that Transport Canada require the replacement of existing Reverse Current Relays (part number A-700AP and A-700AAP) fitted to De Havilland DHC-6 aircraft with relays of a higher current rating and improved design of the electrical contacts.
While the Authorised Release Certificates recorded that both A-700A relays had been overhauled, the maintenance organisation responsible confirmed that they had not undergone a full overhaul, but instead had been electrically tested in accordance with what they believed was the OEM manual. The normal practice was that if the relay failed any part of the test then the relevant component would be replaced and the relay retested. This approach was entirely consistent with the DHC-6 Inspection Requirements Manual, which only required the relays to be bench tested every 3,000 flying hours. However, the left RCR which caught fire had only flown for approximately 35 flying hours since it was last tested and the right RCR (serial number A98995) removed prior to the start of the ferry flight, had only flown approximately 13 flying hours.
While the subsequent internal visual examination of the right RCR (serial number A98995) established that one of the coils appeared to have been degraded by heat due to normal aging, there would have been no requirement to replace this coil providing the RCR passed the required electrical test. The contact pressure is a factor in preventing arcing across the contacts and is normally established by measuring the relay over-travel, but this parameter is only checked during overhaul of the relay and cannot be established during electrical tests. It is, therefore, possible that an RCR with a degraded coil and insufficient contact pressure could pass all the required tests and be authorised to fly for a further 3,000 hours. The following Safety Recommendation is, therefore, made to Transport Canada:
Safety Recommendation 2010-086
It is recommended that Transport Canada reviews the maintenance requirements for the Reverse Current Relay fitted to De Havilland DHC-6 aircraft and considers requiring the relay to be overhauled on a regular basis.
The Authorized Release Certificate for RCRs serial numbers 33284 and 33283 stated that the relays had been overhauled I.A.W Hartman Manual A-700A.
© Crown copyright 2010 27
AAIB Bulletin: 11/2010 C-FAKB EW/C2010/02/01
While the document which the overhaul agency referred to was annotated with the OEMs name, the OEM has advised the investigation that they have not produced an overhaul manual for the A-700A RCRs. Moreover, the title of the document is Installation Instructions and only contained information on the testing of the relay. The following Safety Recommendation is, therefore, made to the overhaul agency:
Safety Recommendation 2010-087
It is recommended that Transport Canada conduct an audit of Condor Aircraft Accessories Incs internal processes to ensure that work recorded on the Authorized Release Certificate accurately reflects the work carried out on the component.
"""

# Load Text Data directly as a Document
text1 = """Synopsis
The pilot, believing that he had an electrical fire,
undertook a precautionary landing. During the ground
run the nose wheel hit a rut causing the aircraft to turn
over on to its back. Both the pilot and passenger were
uninjured. An engineering investigation found that the
alternator drive belt had failed.
History of the flight
The pilot carried out the pre-flight check during which he
confirmed that there was sufficient oil in the engine and
then departed from his home airfield at Andrewsfield on a
local cross country flight. After flying for approximately
35 minutes at a height of 1,800 ft the pilot noticed blue
smoke coming out of the forward section of both sides of
the engine cowling. At the same time the pilot became
aware of a strong smell of electrical burning and
reported hearing a change in the engine noise similar to
when the magneto checks are carried out. He checked
the engine indications, which appeared normal, and
noticed that the low voltage warning light was glowing
very brightly.
The pilot, believing that he had an electrical fire, decided
to make an immediate landing in a large field of wheat
directly ahead of the aircraft. As he closed the throttle
to idle the smoke appeared to stop; nevertheless, he
made a Mayday call to Andrewsfield Radio on 130.55
Mhz and continued with the precautionary landing. The
pilot states that he consulted the emergency checklist
for fire in flight, but elected to leave the electrical
Master Switch ON so that he could operate the flaps
and radio. The aircraft was established on a stable
approach, with a 5 kt tail wind, and once full flaps were
selected, the pilot stated that he turned off the Master
Switch and subsequently held the aircraft in the flare
until the mainwheels touched down at approximately
50 kt. However, as the nose was lowered the aircraft
appeared to come to an abrupt halt and turned over on to
its back. The engine stopped as the propeller struck the
ground and the pilot exited the aircraft through his door
and then assisted the passenger to vacate the aircraft.
Shortly afterwards two farmers and the Police and
Air Ambulance helicopters arrived to offer assistance.
Both the pilot and passenger were unhurt.
Damage to aircraft
The nose landing gear leg was bent back against the
fuselage; the fin, rudder and wings were buckled and
distorted; the windscreen was cracked; one blade on
the propeller was bent; the engine was shock loaded,
the casing on the alternator had suffered impact damage
and the drive belt had failed. There was no evidence of
a fire having occurred.
Comment
From photographs of the accident site and comments
from an engineer who inspected the aircraft it was
established that the aircraft touched down on all three
wheels in a level attitude. The engineer stated that there
was a large rut across the field approximately 12 m
after the touch down point, which he believes caused
the nose landing gear to collapse and the aircraft to turn
over. The flaps were found in the retracted position.
Another battery was fitted to the aircraft and its electrical
systems were operated for 15 minutes and found to
operate normally with no evidence of any electrical
burning smells. The engine oil level was found to be
satisfactory with no indication of there having been
either an oil leak or spillage.
It is believed that the blue smoke and the illumination of
the low voltage warning light were both caused when the
alternator drive belt failed."""


# Neo4j settings
graph_driver = Neo4jGraph(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

# initialise FastAPI
app = FastAPI()

# Test Service running endpoint
@app.get("/")
def read_root():
  return {"message": "Service is running."}
 
# upload document, process and transform to knowledge graph data
@app.post("/documents")
async def post_documents(file: UploadFile = File(...)):
  # check for file
  if not file:
    raise HTTPException(status_code=400, detail="File is required")
  
  # check for supported file type
  allowed_extenssions = {"pdf"}
  file_extension = file.filename.split(".")[-1].lower()
  if file_extension not in allowed_extenssions:
    raise HTTPException(status_code=400, detail="Unsupported file type")
  
  # reset file pointer for processing
  file.file.seek(0)
  
  # process the file to extract text for neo4j insertion
  try: 
    file_content = file.file.read()
    if not file_content:
      raise HTTPException(status_code=400, detail="File is empty or unreadable")
    
    processed_data = process_document(file_content, file_extension)
    if not processed_data or "text" not in processed_data:
      raise HTTPException(
        status_code=500, detail="Error processing file: no content extracted"
      )
      
    processed_text = processed_data["text"]

    # create Document Object directly for test text
    docs = [Document(page_content=processed_text)]

    # split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
    )
    
    documents = text_splitter.split_documents(documents=docs)

  
    graph_documents = llm_transformer.convert_to_graph_documents(documents)
    graph_driver.add_graph_documents(
        graph_documents, baseEntityLabel=True, include_source=True
    )
    
    return {
      "status": 200,
      "message": f"Document '{file.filename}' succesfully processed and added to Neo4j.",
      "graph_documents_count": len(graph_documents),
      "graph_documents": graph_documents      
    }
  except Exception as e:
    raise HTTPException(status_code=500, detail={f"An internal error occured duing processing: {e}"})
        