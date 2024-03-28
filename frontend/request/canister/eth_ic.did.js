export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'bindPrincipalWithEthAddress' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getPrincipalByEthAddress' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
