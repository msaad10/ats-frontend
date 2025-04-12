import React from 'react';
import { Table } from 'react-bootstrap';
import { theme } from '../../styles/theme';

const StyledTable = ({ children, ...props }) => {
  return (
    <div className="table-responsive">
      <Table 
        hover 
        {...props}
        style={{
          backgroundColor: theme.colors.background.main,
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        {React.Children.map(children, child => {
          if (!child) return null;

          if (child.type === 'thead') {
            return React.cloneElement(child, {
              style: {
                ...child.props.style,
                position: 'sticky',
                top: 0,
                zIndex: 1,
              },
              children: React.Children.map(child.props.children, trChild => {
                if (!trChild) return null;
                return React.cloneElement(trChild, {
                  style: {
                    ...trChild.props.style,
                  },
                  children: React.Children.map(trChild.props.children, thChild => {
                    if (!thChild) return null;
                    return React.cloneElement(thChild, {
                      style: {
                        ...theme.table.styles.header,
                        ...thChild.props.style,
                      }
                    });
                  })
                });
              })
            });
          }

          if (child.type === 'tbody') {
            return React.cloneElement(child, {
              children: React.Children.map(child.props.children, (trChild, index) => {
                if (!trChild) return null;
                return React.cloneElement(trChild, {
                  style: {
                    ...trChild.props.style,
                    backgroundColor: index % 2 === 0 ? 
                      theme.colors.table.row.background : 
                      theme.colors.table.row.backgroundAlt,
                  },
                  children: React.Children.map(trChild.props.children, tdChild => {
                    if (!tdChild) return null;
                    return React.cloneElement(tdChild, {
                      style: {
                        ...theme.table.styles.cell,
                        ...tdChild.props.style,
                      }
                    });
                  })
                });
              })
            });
          }

          return child;
        })}
      </Table>
    </div>
  );
};

export default StyledTable;

// Add global styles to index.css or a new CSS file:
/*
.table-responsive {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.table-responsive table {
  margin-bottom: 0;
}

.table-responsive tbody tr:hover {
  background-color: #f0f7ff !important;
}
*/ 