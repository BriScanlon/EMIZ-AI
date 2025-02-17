import { useEffect, useState } from "react";
import { getNodeData } from "../../services/api";
import styles from "./Table.module.scss"; // Import the module
import Spinner from "../../ui/Spinner/Spinner";

const Table = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await getNodeData();
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [data]);

  if (!data) return <Spinner />;

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.heading}>Nodes</h2>
      {renderNodesTable(data)}
      <h2 className={styles.heading}>Categories</h2>
      {renderCategoriesTable(data)}
      <h2 className={styles.heading}>Links</h2>
      {renderLinksTable(data)}
    </div>
  );
};

const renderNodesTable = (data) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}>ID</th>
          <th className={styles.th}>Name</th>
          <th className={styles.th}>Category</th>
        </tr>
      </thead>
      <tbody>
        {data.nodes.map((node) => (
          <tr key={node.id}>
            <td className={styles.td}>{node.id}</td>
            <td className={styles.td}>{node.name}</td>
            <td className={styles.td}>
              {data.categories[node.category]?.name || "Unknown"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderCategoriesTable = (data) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}>Category</th>
          <th className={styles.th}>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.categories.map((category, index) => (
          <tr key={index}>
            <td className={styles.td}>{category.name}</td>
            <td className={styles.td}>
              {category.description || "No description"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderLinksTable = (data) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}>Source Name</th>
          <th className={styles.th}>Target Name</th>
          <th className={styles.th}>Relationship</th>
        </tr>
      </thead>
      <tbody>
        {data.links.map((link, index) => (
          <tr key={index}>
            <td className={styles.td}>
              {data.nodes.find((node) => node.id === link.source)?.name ||
                "Unknown"}
            </td>
            <td className={styles.td}>
              {data.nodes.find((node) => node.id === link.target)?.name ||
                "Unknown"}
            </td>
            <td className={styles.td}>{"Affects"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
