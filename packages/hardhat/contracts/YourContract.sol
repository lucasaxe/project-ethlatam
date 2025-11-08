// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";
// ADICIONE A INTERFACE DO ERC20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YourContract {
    
    // --- Estruturas ---
    struct NGO {
        string name;
        address owner;
        uint256 reputation;
        bool isRegistered;
        uint256 totalRaisedByNgo;
    }

    struct Post {
        uint256 postId;
        address ngoOwner;
        string contentUrl;
        uint256 likeCount;
        uint256 totalDonated;
    }

    struct PostWithNgoDetails {
        uint256 postId;
        address ngoOwner;
        string contentUrl;
        uint256 likeCount;
        uint256 totalDonated;
        string ngoName;
        uint256 ngoReputation;
    }

    // --- NOVA ESTRUTURA PARA O PENHOR (PLEDGE) ---
    struct Pledge {
        uint256 pledgeId;        // ID do penhor
        address donor;           // Endereço do doador
        address token;           // Endereço do token (ex: WETH)
        uint256 amount;          // Quantidade de tokens
        address ngoAddress;      // ONG que receberá
        uint256 minReputation;   // Reputação mínima exigida
        uint256 postId;          // Post ao qual está atrelado (opcional, mas bom)
        bool isActive;           // Se o penhor ainda está ativo
    }

    // --- Armazenamento ---
    mapping(address => NGO) public ngos;
    Post[] public allPosts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => uint256[]) public ngoPosts;

    // --- NOVO ARMAZENAMENTO PARA PENHORES ---
    
    // Um contador para IDs de Penhores
    uint256 private _pledgeCounter;
    
    // Mapeia um ID de penhor para o Penhor
    mapping(uint256 => Pledge) public pledges;
    
    // Mapeia um endereço de ONG para uma lista de IDs de penhores pendentes
    mapping(address => uint256[]) public pendingPledgesForNGO;


    // --- Eventos ---
    event NGORegistered(address indexed ngoAddress, string name);
    event PostCreated(uint256 indexed postId, address indexed ngoAddress, string contentUrl);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
    event PostDonated(uint256 indexed postId, address indexed donator, uint256 amount);
    event NGOProfileUpdated(address indexed ngoAddress, string newName);

    // --- NOVO EVENTO PARA PENHOR ---
    event DonationPledged(
        uint256 indexed pledgeId,
        address indexed donor,
        address indexed ngoAddress,
        uint256 postId,
        address token,
        uint256 amount,
        uint256 minReputation
    );
    
    // --- NOVO EVENTO PARA EXECUÇÃO ---
    event PledgeExecuted(
        uint256 indexed pledgeId,
        address indexed donor,
        address indexed ngoAddress,
        uint256 amount
    );


    // --- Funções de Leitura --- (Completadas com a versão antiga)
    function getPostCount() public view returns (uint256) {
        return allPosts.length;
    }

    function getPostDetails(uint256 _postId) public view returns (PostWithNgoDetails memory) {
        require(_postId < allPosts.length, "Post nao existe");
        
        Post storage post = allPosts[_postId];
        NGO storage ngo = ngos[post.ngoOwner];

        return PostWithNgoDetails({
            postId: post.postId,
            ngoOwner: post.ngoOwner,
            contentUrl: post.contentUrl,
            likeCount: post.likeCount,
            totalDonated: post.totalDonated,
            ngoName: ngo.name,
            ngoReputation: ngo.reputation
        });
    }

    function getNgoPostIds(address _ngoOwner) public view returns (uint256[] memory) {
        return ngoPosts[_ngoOwner];
    }


    // --- Funções de Escrita --- (Completadas com a versão antiga)

    function registerNGO(string memory _name) public {
        address _ngoOwner = msg.sender;
        require(!ngos[_ngoOwner].isRegistered, "ONG ja registrada");

        ngos[_ngoOwner] = NGO({
            name: _name,
            owner: _ngoOwner,
            reputation: 0,
            isRegistered: true,
            totalRaisedByNgo: 0 // <-- INICIALIZADO AQUI
        });

        emit NGORegistered(_ngoOwner, _name);
    }

    function updateNGOName(string memory _newName) public {
        address _ngoOwner = msg.sender;
        require(ngos[_ngoOwner].isRegistered, "Voce nao e uma ONG registrada");
        ngos[_ngoOwner].name = _newName;
        emit NGOProfileUpdated(_ngoOwner, _newName);
    }

    function createPost(string memory _contentUrl) public {
        address _ngoOwner = msg.sender;
        require(ngos[_ngoOwner].isRegistered, "Voce nao e uma ONG registrada");

        uint256 _postId = allPosts.length;

        Post memory newPost = Post({
            postId: _postId,
            ngoOwner: _ngoOwner,
            contentUrl: _contentUrl,
            likeCount: 0,
            totalDonated: 0
        });

        allPosts.push(newPost);
        ngoPosts[_ngoOwner].push(_postId);

        emit PostCreated(_postId, _ngoOwner, _contentUrl);
    }

    // A SUA FUNÇÃO DE DOAÇÃO ATUAL (Mantida para doações diretas, se desejar)
    function donateToPost(uint256 _postId) public payable {
        require(_postId < allPosts.length, "Post nao existe");
        require(msg.value > 0, "Voce deve enviar alguma quantia");

        Post storage post = allPosts[_postId];
        post.totalDonated += msg.value;
        
        NGO storage ngo = ngos[post.ngoOwner];
        ngo.totalRaisedByNgo += msg.value;
        
        address _ngoOwner = post.ngoOwner;
        (bool success, ) = payable(_ngoOwner).call{value: msg.value}("");
        require(success, "Transferencia falhou");

        emit PostDonated(_postId, msg.sender, msg.value);
    }

    // --- !! NOVAS FUNÇÕES DE PENHOR (PLEDGE) !! ---

    /**
     * @dev Registra um "penhor" de doação. Não transfere fundos, apenas salva a promessa.
     * O usuário DEVE ter chamado `approve()` no contrato do WETH antes disso.
     */
    function pledgeDonation(
        uint256 _postId,
        address _token, // Endereço do WETH
        uint256 _amount, // Quantidade em Wei (18 decimais)
        uint256 _minReputationTokens
    ) public {
        require(_postId < allPosts.length, "Post nao existe");
        require(_amount > 0, "Valor deve ser maior que zero");
        
        Post storage post = allPosts[_postId];
        address _ngoOwner = post.ngoOwner;

        // 1. Verificar se o contrato tem permissão (allowance)
        uint256 allowance = IERC20(_token).allowance(msg.sender, address(this));
        require(allowance >= _amount, "Verifique a permissao (approve) do token");

        // 2. Criar e salvar o penhor
        uint256 pledgeId = _pledgeCounter++;
        Pledge storage newPledge = pledges[pledgeId];
        
        newPledge.pledgeId = pledgeId;
        newPledge.donor = msg.sender;
        newPledge.token = _token;
        newPledge.amount = _amount;
        newPledge.ngoAddress = _ngoOwner;
        newPledge.minReputation = _minReputationTokens;
        newPledge.postId = _postId;
        newPledge.isActive = true;

        // 3. Adicionar à lista de pendências da ONG
        pendingPledgesForNGO[_ngoOwner].push(pledgeId);

        // 4. Emitir evento
        emit DonationPledged(
            pledgeId,
            msg.sender,
            _ngoOwner,
            _postId,
            _token,
            _amount,
            _minReputationTokens
        );
    }

    /**
     * @dev Função "Gatilho" (Keeper). Verifica e executa penhores pendentes para uma ONG.
     * Isso pode ser chamado por CADA UM que curtir (em `likePost`) ou por um bot.
     */
    function _executeReadyPledges(address _ngoAddress) internal {
        NGO storage ngo = ngos[_ngoAddress];
        uint256 currentReputation = ngo.reputation;

        uint256[] storage pledgeIds = pendingPledgesForNGO[_ngoAddress];
        uint256[] memory newPledgeIds = new uint256[](pledgeIds.length);
        uint256 newPledgeCount = 0;

        for (uint i = 0; i < pledgeIds.length; i++) {
            uint256 pledgeId = pledgeIds[i];
            Pledge storage pledge = pledges[pledgeId];

            if (!pledge.isActive) {
                continue; // Já foi processado ou cancelado
            }

            // A MÁGICA ACONTECE AQUI:
            if (currentReputation >= pledge.minReputation) {
                // Condição atingida! Tentar executar a transferência.
                
                // Usamos `transferFrom` para "puxar" os fundos (WETH) da carteira do doador
                bool success = IERC20(pledge.token).transferFrom(
                    pledge.donor,
                    pledge.ngoAddress,
                    pledge.amount
                );

                if (success) {
                    // Deu certo!
                    pledge.isActive = false; // Desativa o penhor
                    
                    // Atualiza os totais
                    ngo.totalRaisedByNgo += pledge.amount; 
                    allPosts[pledge.postId].totalDonated += pledge.amount;

                    emit PledgeExecuted(pledgeId, pledge.donor, pledge.ngoAddress, pledge.amount);
                } else {
                    // Falhou (ex: doador não tem mais fundos). 
                    // Mantém o penhor ativo para tentar de novo.
                    newPledgeIds[newPledgeCount] = pledgeId;
                    newPledgeCount++;
                }
            } else {
                // Condição ainda não atingida, mantém o penhor na lista
                newPledgeIds[newPledgeCount] = pledgeId;
                newPledgeCount++;
            }
        }

        // Limpa a lista antiga e recria com os penhores que sobraram
        delete pendingPledgesForNGO[_ngoAddress];
        for (uint i = 0; i < newPledgeCount; i++) {
            pendingPledgesForNGO[_ngoAddress].push(newPledgeIds[i]);
        }
    }
    
    // --- MODIFICAÇÃO EM `likePost` ---
    // Agora, `likePost` também atua como o GATILHO
    function likePost(uint256 _postId) public {
        address _liker = msg.sender;
        require(_postId < allPosts.length, "Post nao existe");
        require(!hasLiked[_postId][_liker], "Voce ja curtiu este post");

        Post storage post = allPosts[_postId];
        NGO storage ngo = ngos[post.ngoOwner];

        hasLiked[_postId][_liker] = true;
        post.likeCount += 1;
        ngo.reputation += 1; // A reputação aumenta

        emit PostLiked(_postId, _liker, post.likeCount);

        // --- GATILHO DE EXECUÇÃO ---
        // Após o like, verifica se algum penhor pode ser executado
        // CUIDADO: Isso pode tornar o `like` mais caro (mais gás)
        if (pendingPledgesForNGO[post.ngoOwner].length > 0) {
            _executeReadyPledges(post.ngoOwner);
        }
    }
}