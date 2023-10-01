import React from 'react';

const PageItem: any =
  React.forwardRef<HTMLLIElement, any>(
    (
      {
        active = false,
        disabled = false,
        className,
        style,
        activeLabel = '(current)',
        children,
        linkStyle,
        linkClassName,
        ...props
      }: any,
      ref,
    ) => {
      const Component = active || disabled ? 'span' : 'a';
      return (
        <li
          ref={ref}
          style={style}
          className={'page-item'}
        >
          <Component
            className={'page-link'}
            style={linkStyle}
            {...props}
          >
            {children}
            {active && activeLabel && (
              <span className="visually-hidden">{activeLabel}</span>
            )}
          </Component>
        </li>
      );
    },
  );

PageItem.displayName = 'PageItem';

function createButton(name: string, defaultValue: any, label = name) {
  const Button = React.forwardRef(
    ({ children, ...props }: any, ref) => (
      <PageItem {...props} ref={ref}>
        <span aria-hidden="true">{children || defaultValue}</span>
        <span className="visually-hidden">{label}</span>
      </PageItem>
    ),
  );

  Button.displayName = name;

  return Button;
}

const First = createButton('First', 'Primeiro');
const Prev = createButton('Prev', 'Anterior', 'Anterior');
const Ellipsis = createButton('Ellipsis', '…', 'Mais');
const Next = createButton('Next', 'Próximo');
const Last = createButton('Last', 'Ultimo');

const Pagination = React.forwardRef<HTMLUListElement, any>(
  ({ bsPrefix, className, size, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        {...props}
        className={'pagination'}
      />
    );
  },
);

Pagination.displayName = 'Pagination';

export interface PaginationControlProps {
  page?: number;
  between?: number;
  total: number;
  limit: number;
  onChangePage?: (page: number) => any;
  next?: boolean;
  last?: boolean;
  ellipsis?: number;
}

export const PaginationControl = ({
  page = 1,
  between = 3,
  total,
  limit,
  onChangePage = page => console.log("Precisa configurar o componente"),
  next = true,
  last = false,
  ellipsis = 0,
  ...paginationProps
}: PaginationControlProps) => {

  const total_pages = Math.ceil(total / limit)

  between = between < 1 ? 1 : between
  page = (page < 1 ? 1 : page > total_pages ? total_pages : page)
  ellipsis = ellipsis < 1 ? 0 : ellipsis + 2 >= between ? between - 2 : ellipsis

  let positions = Array.from({ length: total_pages }, (_, i) => i)

  const qtd_pages = (between * 2) + 1
  const range = (
    total_pages <= qtd_pages
      // Show active without slice
      ? positions
      : page - 1 <= between
        // Show active in left
        ? positions.slice(0, qtd_pages - (ellipsis > 0 ? ellipsis + 1 : 0))
        : page + between >= total_pages
          // Show active in right
          ? positions.slice(total_pages - qtd_pages + (ellipsis > 0 ? ellipsis + 1 : 0), total_pages)
          // Show active in middle
          : positions.slice((page - 1) - (between - (ellipsis > 0 ? ellipsis + 1 : 0)), page + (between - (ellipsis > 0 ? ellipsis + 1 : 0)))
  )

  return (
    total !== null && total > 0
      ? <Pagination {...paginationProps}>
        {
          last
          && <First
            onClick={() => page > 1 ? onChangePage(1) : {}}
            disabled={page <= 1} />
        }
        {
          next
          && <Prev
            onClick={() => page > 1 ? onChangePage(page - 1) : {}}
            disabled={page <= 1} />
        }
        {
          total_pages > (between * 2) + 1 && ellipsis > 0
          && positions.slice(0, page - 1 <= between ? 0 : ellipsis).map(value => {
            return <PageItem key={value}
              onClick={() => value !== page - 1 ? onChangePage(value + 1) : {}}>
              {value + 1}
            </PageItem>
          })
        }
        {
          // Show ellipsis when "page" is bigger than "between"
          total_pages > (between * 2) + 1 && ellipsis > 0 && page - 1 > between
          && <Ellipsis disabled />
        }
        {range.map(value => {
          return <PageItem active={value === page - 1}
            key={value}
            onClick={() => value !== page - 1 ? onChangePage(value + 1) : {}}>
            {value + 1}
          </PageItem>
        })}
        {
          // Show ellipsis when "page" is lower than "between"
          total_pages > (between * 2) + 1 && ellipsis > 0 && page < total_pages - between
          && <Ellipsis disabled />
        }
        {
          total_pages > (between * 2) + 1 && ellipsis > 0
          && positions.slice(page >= total_pages - between ? total_pages : total_pages - ellipsis, total_pages).map(value => {
            return <PageItem key={value}
              onClick={() => value !== page - 1 ? onChangePage(value + 1) : {}}>
              {value + 1}
            </PageItem>
          })
        }
        {
          next
          && <Next
            onClick={() => page < total_pages ? onChangePage(page + 1) : {}}
            disabled={page >= total_pages} />
        }
        {
          last
          && <Last
            onClick={() => page < total_pages ? onChangePage(total_pages) : {}}
            disabled={page >= total_pages} />
        }
      </Pagination>
      : <></>
  )
}