import argparse
import os
import datetime
from neo4j import GraphDatabase


def export_neo4j_data(uri, auth, backup_dir):
    """Backs up Neo4j data as CSV and Cypher files."""
    driver = GraphDatabase.driver(uri, auth=auth)

    with driver.session() as session:
        # Export CSV as stream (prints output)
        result = session.run("CALL apoc.export.csv.all(null, {stream: true})")

        # Debug: Check the actual returned keys
        for record in result:
            print(record.keys())  # Print available keys
            print(record)  # Print actual record

        # Try using the correct key based on printed output
        csv_output = "\n".join(
            [
                (
                    record["cypherStatements"]
                    if "cypherStatements" in record.keys()
                    else record["file"]
                )
                for record in result
            ]
        )

        csv_file = os.path.join(backup_dir, "neo4j_backup.csv")
        with open(csv_file, "w", encoding="utf-8") as f:
            f.write(csv_output)
        print(f"✅ CSV Backup Saved: {csv_file}")

        # Export Cypher as stream
        result = session.run("CALL apoc.export.cypher.all(null, {stream: true})")

        # Debug: Check actual result keys
        for record in result:
            print(record.keys())
            print(record)

        # Try using the correct key
        cypher_output = "\n".join(
            [
                (
                    record["cypherStatements"]
                    if "cypherStatements" in record.keys()
                    else record["file"]
                )
                for record in result
            ]
        )

        cypher_file = os.path.join(backup_dir, "neo4j_backup.cypher")
        with open(cypher_file, "w", encoding="utf-8") as f:
            f.write(cypher_output)
        print(f"✅ Cypher Backup Saved: {cypher_file}")

    driver.close()


def restore_from_csv(uri, auth, csv_file):
    """Restores data from a CSV file into Neo4j."""
    driver = GraphDatabase.driver(uri, auth=auth)

    with driver.session() as session:
        session.run(
            f"""
        LOAD CSV WITH HEADERS FROM 'file:///{os.path.basename(csv_file)}' AS row
        CREATE (n:Node {{data: row}});
        """
        )
        print(f"✅ Data Restored from CSV: {csv_file}")

    driver.close()


def restore_from_cypher(uri, auth, cypher_file):
    """Restores data from a Cypher script file."""
    driver = GraphDatabase.driver(uri, auth=auth)

    with driver.session() as session:
        with open(cypher_file, "r") as file:
            cypher_commands = file.read()
            session.run(cypher_commands)
            print(f"✅ Data Restored from Cypher: {cypher_file}")

    driver.close()


def main():
    parser = argparse.ArgumentParser(description="Neo4j Backup & Restore Utility")
    parser.add_argument(
        "--uri",
        required=True,
        help="Neo4j connection URI (e.g., bolt://localhost:7687)",
    )
    parser.add_argument("--user", required=True, help="Neo4j username")
    parser.add_argument("--password", required=True, help="Neo4j password")
    parser.add_argument("--file", required=True, help="File path for backup or restore")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["backup", "restore"],
        help="Mode: backup or restore",
    )

    args = parser.parse_args()
    auth = (args.user, args.password)

    if args.mode == "backup":
        os.makedirs(args.file, exist_ok=True)  # Ensure backup directory exists
        export_neo4j_data(args.uri, auth, args.file)

    elif args.mode == "restore":
        if args.file.endswith(".csv"):
            restore_from_csv(args.uri, auth, args.file)
        elif args.file.endswith(".cypher"):
            restore_from_cypher(args.uri, auth, args.file)
        else:
            print("❌ Unsupported file format for restore. Use CSV or Cypher.")


if __name__ == "__main__":
    main()
