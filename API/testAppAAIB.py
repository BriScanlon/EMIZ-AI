"""This example illustrates how to get started easily with the SimpleKGPipeline
and ingest text into a Neo4j Knowledge Graph.

This example assumes a Neo4j db is up and running. Update the credentials below
if needed.

NB: when building a KG from text, no 'Document' node is created in the Knowledge Graph.
"""

import asyncio
import logging

import neo4j
from neo4j_graphrag.embeddings.ollama import OllamaEmbeddings
from neo4j_graphrag.experimental.pipeline.kg_builder import SimpleKGPipeline
from neo4j_graphrag.experimental.pipeline.pipeline import PipelineResult
from neo4j_graphrag.experimental.pipeline.types import (
    EntityInputType,
    RelationInputType,
)
from neo4j_graphrag.llm import LLMInterface
from neo4j_graphrag.llm import OllamaLLM

logging.basicConfig()
logging.getLogger("neo4j_graphrag").setLevel(logging.DEBUG)
# logging.getLogger("neo4j_graphrag").setLevel(logging.INFO)


# Neo4j db infos
URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "TestPassword")
DATABASE = "neo4j"
embedder = OllamaEmbeddings(model="mxbai-embed-large")

# Text to process
TEXT = """© Crown copyright 2010 28
AAIB Bulletin: 8/2010 G-JEDI EW/C2009/12/02
INCIDENT
Aircraft Type and Registration: DHC-8-402 Dash 8, G-JEDI
No & Type of Engines: 2 Pratt & Whitney Canada PW150A turboprop engines
Year of Manufacture: 2001
Date & Time (UTC): 21 December 2009 at 1052 hrs
Location: London Gatwick Airport
Type of Flight: Commercial Air Transport (Passenger)
Persons on Board: Crew - 4 Passengers - 72
Injuries: Crew - None Passengers - None
Nature of Damage: Damage to a wiring loom, and structure, in the left centre-wing section
Commanders Licence: Air Transport Pilots Licence
Commanders Age: 33 years
Commanders Flying Experience: 4,241 hours (of which 2,677 were on type)
Last 90 days - 108 hours
Last 28 days - 35 hours
Information Source: AAIB Field Investigation
Synopsis
During departure from London Gatwick Airport, the aircraft suffered a failure of its AC electrical system. A PAN was declared and the aircraft returned to Gatwick for an uneventful landing. Examination revealed wiring damage in the trailing edge area of the left centre wing that was due to chafing from the head of a blind rivet in a loom support bracket. The aircraft manufacturer has since issued a modification to replace the blind rivets with solid rivets and to inspect the wiring for damage.
History of the flight
The aircraft departed London Gatwick Airport on a scheduled passenger flight to Düsseldorf. As it climbed through 6,000 ft the following caution lights illuminated almost simultaneously on the caution and warning annunciator panel:
l
ac bu s, r ac bu s, l tru, r tru, #1 ac gen ,
#2 ac gen
along with a series of associated system failure captions.
The commander judged that the l and r ac bu BUs cautions had illuminated first. As the aircraft continued to climb towards its cleared level of FL120 the pilots requested descent to avoid icing conditions. ATC cleared the aircraft to descend to FL110 but, because it remained in icing conditions with limited icing protection available,"""

# Instantiate Entity and Relation objects. This defines the
# entities and relations the LLM will be looking for in the text.
ENTITIES: list[EntityInputType] = [
    "Aircraft",
    {"label": "System", "description": "A system or subsystem within the aircraft"},
    {"label": "Component", "description": "A specific component or part of a system"},
    {"label": "FailureMode", "description": "The type of failure that occurred"},
    {"label": "Symptom", "description": "Observable signs of failure"},
    {"label": "Resolution", "description": "Actions taken to resolve the issue"},
    {
        "label": "Incident",
        "description": "An event involving aircraft failure or system issues",
    },  # <-- ADD THIS
]

# same thing for relationships:
RELATIONS: list[RelationInputType] = [
    {"label": "PART_OF", "description": "Defines a component as part of a system"},
    {
        "label": "AFFECTS",
        "description": "Indicates that a failure mode affects a system",
    },
    {
        "label": "LEADS_TO",
        "description": "Indicates that a failure mode causes a symptom",
    },
    {"label": "RESOLVED_BY", "description": "Defines a resolution for a failure mode"},
    {"label": "OCCURRED_ON", "description": "Links an incident to a specific aircraft"},
]
POTENTIAL_SCHEMA = [
    ("Component", "PART_OF", "System"),
    ("FailureMode", "AFFECTS", "System"),
    ("FailureMode", "LEADS_TO", "Symptom"),
    ("FailureMode", "RESOLVED_BY", "Resolution"),
    ("Incident", "OCCURRED_ON", "Aircraft"), 
]


async def define_and_run_pipeline(
    neo4j_driver: neo4j.Driver,
    llm: LLMInterface,
) -> PipelineResult:
    # Create an instance of the SimpleKGPipeline
    kg_builder = SimpleKGPipeline(
        llm=llm,
        driver=neo4j_driver,
        embedder=embedder,
        entities=ENTITIES,
        relations=RELATIONS,
        potential_schema=POTENTIAL_SCHEMA,
        from_pdf=False,
        neo4j_database=DATABASE,
    )
    return await kg_builder.run_async(text=TEXT)


async def main() -> PipelineResult:
    llm = OllamaLLM(
        model_name="phi4",
    )
    with neo4j.GraphDatabase.driver(URI, auth=AUTH) as driver:
        res = await define_and_run_pipeline(driver, llm)
    return res


if __name__ == "__main__":
    res = asyncio.run(main())
    print(res)
