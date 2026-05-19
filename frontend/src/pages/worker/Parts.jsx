import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    useEffect(() => {
        api.get('/api/parts')
        .then(res => setParts(res.data))
        .catch(() => setError('Error loading parts.'))
        .finally(() => setLoading(false));
    }, []);

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Parts 
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Inventory overview
        </p>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{
          background: 'var(--card)',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Part Number', 'Brand', 'Model', 'Price', 'Stock'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No parts available.
                  </td>
                </tr>
              )}
              {parts.map((p, i) => (
                <tr key={p.id} style={{
                  borderBottom: i < parts.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    #{p.id}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {p.partNumber}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {p.brand}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {p.model}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    ${p.price?.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: p.stockQuantity > 0 ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: p.stockQuantity > 0 ? 'var(--green)' : 'var(--red)',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {p.stockQuantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
    );
}